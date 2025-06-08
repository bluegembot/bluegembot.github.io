// AutoOpenPage.ts
import { ref, onMounted, onUnmounted } from "vue";
import { WS_URL } from '@/config/environment';

export default {
    setup() {
        const socket = ref<WebSocket | null>(null);
        const reconnectTimeout = ref<number | null>(null);
        const isManualDisconnect = ref<boolean>(false);

        // Reactive variables
        const isAutoOpenerActive = ref(false);
        const errorMessage = ref("");

        // Permission checking variables
        const hasPopupPermission = ref<boolean | null>(null);
        const permissionChecked = ref(false);

        // Check browser permissions on component mount
        onMounted(() => {
            // await checkBrowserPermissions();
            testPopupPermission()
        });

        // Permission checking functions
        async function checkBrowserPermissions() {
            // Method 1: Try Permissions API first (limited browser support)
            if ('permissions' in navigator) {
                try {
                    const result = await (navigator.permissions as any).query({ name: 'popup' });
                    if (result.state === 'granted') {
                        hasPopupPermission.value = true;
                        permissionChecked.value = true;
                        await testPopupPermission()
                        return;
                    } else if (result.state === 'denied') {
                        hasPopupPermission.value = false;
                        permissionChecked.value = true;
                        return;
                    }
                } catch (error) {
                    // Popup permission query not supported, fall back to test method
                }
            }

            // Method 2: Test by attempting to open a window
            await testPopupPermission();
        }

        async function testPopupPermission() {
            try {
                // Try to open a small test window off-screen
                const testWindow = window.open('', '_blank', 'width=1,height=1,left=-1000,top=-1000');
                if (testWindow) {
                    hasPopupPermission.value = true;
                    console.log('Has permission')
                    testWindow.close()
                } else {
                    hasPopupPermission.value = false;
                    console.log('No permission')
                    testWindow.close()
                }
            } catch (error) {
                hasPopupPermission.value = false;
                testWindow.close()
            }
            permissionChecked.value = true;
            testWindow.close()
        }

        function reloadPage(){
            location.reload()
        }

        // Toggle function
        const toggleAutoOpener = () => {
            try {
                isAutoOpenerActive.value = !isAutoOpenerActive.value;
                if (isAutoOpenerActive.value === true) {
                    connectToWebSocket();
                } else {
                    closeWebSocket();
                }
            } catch (error) {
                errorMessage.value = "An error occurred.";
            }
        };

        function connectToWebSocket() {
            if (socket.value && socket.value.readyState !== WebSocket.CLOSED) {
                return;
            }

            const wsUrl = `${WS_URL}`;

            try {
                socket.value = new WebSocket(wsUrl);

                socket.value.onopen = () => {
                    socket.value?.send(JSON.stringify({ action: "greet", message: "Hello, server!" }));

                    if (reconnectTimeout.value) {
                        clearTimeout(reconnectTimeout.value);
                        reconnectTimeout.value = null;
                    }

                    isManualDisconnect.value = false;
                };

                socket.value.onmessage = (event) => {
                    const data = event.data;
                    openUrlInNewTab(data);
                };

                socket.value.onclose = (event) => {
                    console.log("WebSocket close event:", {
                        code: event.code,
                        reason: event.reason,
                        wasClean: event.wasClean
                    });

                    if (event.code === 4001) {
                        console.error("Unauthorized: No session token provided.");
                        errorMessage.value = "Authentication failed. Please log in again.";
                        isAutoOpenerActive.value = false;
                    } else {
                        console.log("WebSocket connection closed by server");

                        if (!isManualDisconnect.value) {
                            attemptReconnect();
                        }
                    }
                };

                socket.value.onerror = (error) => {
                    console.error("WebSocket error details:", {
                        readyState: socket.value?.readyState,
                        url: socket.value?.url,
                        protocol: socket.value?.protocol,
                        error: error
                    });
                    errorMessage.value = "Connection error. Attempting to reconnect...";

                    if (!isManualDisconnect.value) {
                        attemptReconnect();
                    }
                };
            } catch (error) {
                console.error("Error creating WebSocket:", error);
                errorMessage.value = "Failed to create WebSocket connection";
            }
        }

        function attemptReconnect() {
            if (!reconnectTimeout.value) {
                reconnectTimeout.value = setTimeout(() => {
                    console.log("Attempting to reconnect...");
                    connectToWebSocket();
                }, 5000) as unknown as number;
            }
        }

        function closeWebSocket() {
            if (socket.value) {
                isManualDisconnect.value = true;
                socket.value.close();
                socket.value = null;
                errorMessage.value = "";
            } else {
                console.log("No active WebSocket connection to close.");
            }
        }

        function openUrlInNewTab(url: string) {
            if (isValidUrl(url)) {
                const newWindow = window.open(url, "_blank");
                // If window.open returns null, permissions might have changed
                if (!newWindow) {
                    hasPopupPermission.value = false;
                    errorMessage.value = "Failed to open URL. Please check your browser's popup settings.";
                }
            } else {
                console.warn("Received invalid URL:", url);
            }
        }

        function isValidUrl(string: string): boolean {
            try {
                new URL(string);
                return true;
            } catch {
                return false;
            }
        }

        // Cleanup on component unmount
        onUnmounted(() => {
            closeWebSocket();
            if (reconnectTimeout.value) {
                clearTimeout(reconnectTimeout.value);
                reconnectTimeout.value = null;
            }
        });

        // Return exposed values and functions
        return {
            isAutoOpenerActive,
            errorMessage,
            toggleAutoOpener,
            hasPopupPermission,
            permissionChecked,
            testPopupPermission,
            reloadPage
        };
    }
};