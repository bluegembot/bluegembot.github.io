import { ref, onMounted } from 'vue';
import type { Ref } from 'vue';
import { API_URL } from '@/config/environment';

export function useAutoOpenPage() {
    const autoOpenerEnabled: Ref<boolean> = ref(false);
    const statusMessage: Ref<string> = ref('');
    const isLoading: Ref<boolean> = ref(true);
    const messageType: Ref<'success' | 'error' | 'info'> = ref('info');

    const toggleAutoOpener = async (): Promise<void> => {
        try {
            // Toggle the state locally first for immediate UI feedback
            const newState = !autoOpenerEnabled.value;
            autoOpenerEnabled.value = newState;

            statusMessage.value = `Setting auto opener to ${newState ? 'enabled' : 'disabled'}...`;
            messageType.value = 'info';

            // Try to get CSRF token
            let csrfToken;
            try {
                const csrfResponse = await fetch(`${API_URL}/csrf-token`, {
                    method: "GET",
                    credentials: "include",
                });

                if (!csrfResponse.ok) {
                    throw new Error("Failed to fetch CSRF token");
                }

                const csrfData = await csrfResponse.json();
                csrfToken = csrfData.csrfToken;
            } catch (error) {
                console.warn("CSRF token fetch failed, continuing without token:", error);
                // Continue without the token since some environments might not require it
            }

            const headers: Record<string, string> = {
                "Content-Type": "application/json"
            };

            if (csrfToken) {
                headers["csrf-token"] = csrfToken;
            }

            // Try to update server state, but don't revert UI if it fails
            try {
                const response = await fetch(`${API_URL}/toggleAutoOpener`, {
                    method: "POST",
                    headers,
                    credentials: "include",
                    body: JSON.stringify({ enabled: newState }),
                });

                if (!response.ok) {
                    throw new Error("Server rejected the request");
                }

                statusMessage.value = `Auto opener ${newState ? 'enabled' : 'disabled'} successfully`;
                messageType.value = 'success';

                // Clear success message after 3 seconds
                setTimeout(() => {
                    if (messageType.value === 'success') {
                        statusMessage.value = '';
                    }
                }, 3000);

            } catch (error) {
                console.warn("Error updating server, but keeping UI state:", error);
                statusMessage.value = "Changed locally, but couldn't update server. Feature will work until page reload.";
                messageType.value = 'error';
            }

        } catch (error) {
            console.error("Critical error in toggle function:", error);
            statusMessage.value = "Something went wrong. Please try again.";
            messageType.value = 'error';
        }
    };

    onMounted(async () => {
        isLoading.value = true;
        statusMessage.value = 'Loading auto opener status...';

        try {
            // Default to disabled if we can't reach the server
            autoOpenerEnabled.value = false;

            // Try to get CSRF token
            let csrfToken;
            try {
                const csrfResponse = await fetch(`${API_URL}/csrf-token`, {
                    method: "GET",
                    credentials: "include",
                });

                if (!csrfResponse.ok) {
                    throw new Error("Failed to fetch CSRF token");
                }

                const csrfData = await csrfResponse.json();
                csrfToken = csrfData.csrfToken;
            } catch (error) {
                console.warn("CSRF token fetch failed, continuing without token:", error);
                // Continue without the token
            }

            const headers: Record<string, string> = {};
            if (csrfToken) {
                headers["csrf-token"] = csrfToken;
            }

            try {
                const response = await fetch(`${API_URL}/getAutoOpenerStatus`, {
                    method: "GET",
                    headers,
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error("Server returned an error");
                }

                const data = await response.json();
                autoOpenerEnabled.value = Boolean(data.enabled);
                statusMessage.value = '';
            } catch (error) {
                console.warn("Couldn't fetch status from server, using default:", error);
                statusMessage.value = "Auto opener is available in local mode";
                messageType.value = 'info';
            }
        } catch (error) {
            console.error("Error in initialization:", error);
            statusMessage.value = "Auto opener is available in local mode";
            messageType.value = 'info';
        } finally {
            isLoading.value = false;
        }
    });

    return {
        autoOpenerEnabled,
        statusMessage,
        messageType,
        isLoading,
        toggleAutoOpener
    };
}