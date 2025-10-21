// AutoOpenPage.ts
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { WS_URL } from '@/config/environment';
import PermissionNotice from "@/components/AutoOpenPage/PermissionNotice.vue";
import NotificationSettings from "@/components/AutoOpenPage/NotificationSettings.vue";

export default {
    components: {
        PermissionNotice,
        NotificationSettings
    },
    setup() {
        const socket = ref<WebSocket | null>(null);
        const reconnectTimeout = ref<number | null>(null);
        const isManualDisconnect = ref<boolean>(false);

        // Reactive variables
        const isAutoOpenerActive = ref(false);
        const errorMessage = ref("");

        // Permission checking variables - start as false so notice shows
        const hasPopupPermission = ref<boolean | null>(false);

        // Console logging variables
        const consoleLogs = ref<Array<{id: number, timestamp: string, message: string, type: string}>>([]);
        const showConsole = ref(true);

        // Reference to the NotificationSettings component
        const notificationSettingsRef = ref<any>(null);

        // Store original console methods
        const originalConsoleLog = console.log;
        const originalConsoleError = console.error;
        const originalConsoleWarn = console.warn;

        // Custom logging function
        function addConsoleLog(message: string, type: string = 'info') {
            const timestamp = new Date().toLocaleTimeString();
            const logEntry = {
                id: Date.now() + Math.random(),
                timestamp,
                message,
                type
            };
            consoleLogs.value.push(logEntry);

            // Keep only last 100 logs
            if (consoleLogs.value.length > 100) {
                consoleLogs.value = consoleLogs.value.slice(-100);
            }

            // Auto scroll to bottom
            nextTick(() => {
                const consoleElement = document.querySelector('.console-logs');
                if (consoleElement) {
                    consoleElement.scrollTop = consoleElement.scrollHeight;
                }
            });
        }

        // Override console methods when auto opener is active
        function enableConsoleCapture() {
            console.log = (...args: any[]) => {
                addConsoleLog(args.join(' '), 'info');
                originalConsoleLog(...args);
            };

            console.error = (...args: any[]) => {
                addConsoleLog(args.join(' '), 'error');
                originalConsoleError(...args);
            };

            console.warn = (...args: any[]) => {
                addConsoleLog(args.join(' '), 'warning');
                originalConsoleWarn(...args);
            };
        }

        // Restore original console methods
        function disableConsoleCapture() {
            console.log = originalConsoleLog;
            console.error = originalConsoleError;
            console.warn = originalConsoleWarn;
        }

        function clearConsole() {
            consoleLogs.value = [];
            addConsoleLog('Console cleared', 'info');
        }

        function toggleConsole() {
            showConsole.value = !showConsole.value;
        }

        // Advanced popup permission detection methods
        function testPopupPermissionFeatureDetection(): boolean {
            console.log('Testing popup permissions (feature detection)...');

            try {
                // Create a minimal popup window
                const popup = window.open('', '_blank', 'width=1,height=1,left=-10000,top=-10000,scrollbars=no,toolbar=no,menubar=no');

                if (!popup) {
                    console.log('No permission (window.open returned null)');
                    return false;
                }

                // Multiple checks for different blocking scenarios
                let isBlocked = false;

                try {
                    // Check various properties that indicate blocking
                    const checks = [
                        popup.closed,
                        typeof popup.closed === 'undefined',
                        popup.outerHeight === 0,
                        popup.outerWidth === 0
                    ];

                    isBlocked = checks.some(check => check);

                    // Additional position check
                    if (!isBlocked && popup.screenX !== undefined && popup.screenY !== undefined) {
                        isBlocked = popup.screenX < -10000 && popup.screenY < -10000;
                    }

                } catch (error) {
                    // If we can't access properties, likely blocked
                    console.log('Property access failed, likely blocked:', error);
                    isBlocked = true;
                }

                // Clean up
                try {
                    popup.close();
                } catch (error) {
                    // Ignore close errors
                }

                if (isBlocked) {
                    console.log('No permission (feature detection failed)');
                    window.close()
                    return false;
                } else {
                    console.log('Has permission (feature detection passed)');
                    window.close()
                    return true;
                }

            } catch (error) {
                console.log('No permission (exception during test):', error);
                return false;
            }
        }

        async function testPopupPermissionWithTimeout(): Promise<boolean> {
            console.log('Testing popup permissions (timeout method)...');

            return new Promise<boolean>((resolve) => {
                try {
                    const testWindow = window.open('about:blank', '_blank', 'width=1,height=1,left=-10000,top=-10000,menubar=no,toolbar=no');

                    if (!testWindow || testWindow.closed || typeof testWindow.closed === 'undefined') {
                        console.log('No permission (immediate detection)');
                        resolve(false);
                        return;
                    }

                    // Use timeout to verify window behavior
                    const verificationTimeout = setTimeout(() => {
                        try {
                            const isBlocked = testWindow.closed ||
                                testWindow.outerHeight === 0 ||
                                testWindow.outerWidth === 0;

                            testWindow.close();

                            if (isBlocked) {
                                console.log('No permission (timeout verification failed)');
                                resolve(false);
                            } else {
                                console.log('Has permission (timeout verification passed)');
                                resolve(true);
                            }
                        } catch (error) {
                            testWindow.close();
                            console.log('No permission (timeout check failed):', error);
                            resolve(false);
                        }
                    }, 50);

                } catch (error) {
                    console.log('No permission (exception in timeout test):', error);
                    resolve(false);
                }
            });
        }

        async function testPopupPermission() {
            try {
                // Method 1: Try Permissions API first (where supported)
                if ('permissions' in navigator) {
                    try {
                        // @ts-ignore - Permissions API might not be fully typed for popups
                        const permission = await navigator.permissions.query({name: 'popup'});

                        if (permission.state === 'granted') {
                            console.log('Has permission (Permissions API - granted)');
                            hasPopupPermission.value = true;
                            return true;
                        } else if (permission.state === 'denied') {
                            console.log('No permission (Permissions API - denied)');
                            hasPopupPermission.value = false;
                            return false;
                        }
                        console.log('Permissions API returned prompt, continuing with other tests...');
                    } catch (error) {
                        console.log('Permissions API not supported for popups, falling back...');
                    }
                }

                // Method 2: Feature detection
                const featureResult = testPopupPermissionFeatureDetection();

                // Method 3: If feature detection passed, double-check with timeout
                if (featureResult) {
                    const timeoutResult = await testPopupPermissionWithTimeout();
                    hasPopupPermission.value = timeoutResult;
                    return timeoutResult;
                } else {
                    hasPopupPermission.value = false;
                    return false;
                }

            } catch (error) {
                console.log('All popup detection methods failed:', error);
                hasPopupPermission.value = false;
                return false;
            }
        }

        // Run permission test when component mounts
        onMounted(async () => {
            await testPopupPermission();
        });

        async function reloadPage(){
            // Test permission when user clicks the recheck button
            await testPopupPermission();
        }

        // Toggle function
        const toggleAutoOpener = async () => {

            try {
                isAutoOpenerActive.value = !isAutoOpenerActive.value;
                if (isAutoOpenerActive.value === true) {
                    enableConsoleCapture();
                    showConsole.value = true;
                    connectToWebSocket();
                } else {
                    disableConsoleCapture();
                    closeWebSocket();
                }
            } catch (error) {
                errorMessage.value = "An error occurred.";
                addConsoleLog(`Toggle error: ${error}`, 'error');
            }
        };

        function connectToWebSocket() {
            if (socket.value && socket.value.readyState !== WebSocket.CLOSED) {
                return;
            }

            const wsUrl = `${WS_URL}`;

            try {
                addConsoleLog(`Connecting to websocket...`, 'info');
                socket.value = new WebSocket(wsUrl);

                socket.value.onopen = () => {
                    addConsoleLog('Connection established successfully', 'info');
                    socket.value?.send(JSON.stringify({ action: "greet", message: "Hello, server!" }));
                    addConsoleLog('Sent greeting message to server', 'info');

                    if (reconnectTimeout.value) {
                        clearTimeout(reconnectTimeout.value);
                        reconnectTimeout.value = null;
                    }

                    isManualDisconnect.value = false;
                };

                socket.value.onmessage = (event) => {
                    const data = event.data;

                    const allowedDomains = ["https://skinport.com/", "https://csfloat.com/"];

                    if (typeof data === "string" && allowedDomains.some(domain => data.startsWith(domain))) {
                        openUrlInNewTab(data);
                    } else {
                        addConsoleLog(`Received message from server: ${data}`, 'info');
                    }
                };

                socket.value.onclose = (event) => {
                    addConsoleLog(`WebSocket closed - Code: ${event.code}, Reason: ${event.reason || 'No reason provided'}`, 'warning');

                    if (event.code === 4001) {
                        console.error("Unauthorized: No session token provided.");
                        errorMessage.value = "Authentication failed. Please log in again.";
                        isAutoOpenerActive.value = false;
                        disableConsoleCapture();
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
                addConsoleLog('Attempting reconnection in 5 seconds...', 'warning');
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
                addConsoleLog('WebSocket connection closed manually', 'info');
            } else {
                console.log("No active WebSocket connection to close.");
            }
        }

        function openUrlInNewTab(url: string) {
            const newWindow = window.open(url, "_blank");
            // If window.open returns null, permissions might have changed
            if (!newWindow) {
                hasPopupPermission.value = false;
                errorMessage.value = "Failed to open URL. Please check your browser's popup settings.";
                addConsoleLog(`Failed to open URL: ${url} - Check popup settings`, 'error');
            } else {
                addConsoleLog(`🎯 DEAL OPENED: ${url}`, 'deal');
                // Play notification sound when deal is opened using the component reference
                if (notificationSettingsRef.value && notificationSettingsRef.value.playNotificationSound) {
                    notificationSettingsRef.value.playNotificationSound();
                }
            }
        }

        // Cleanup on component unmount
        onUnmounted(() => {
            disableConsoleCapture();
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
            reloadPage,
            consoleLogs,
            showConsole,
            toggleConsole,
            clearConsole,
            addConsoleLog,
            notificationSettingsRef
        };
    }
};
