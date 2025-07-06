import { onMounted, ref } from "vue";
import type { Ref } from "vue";
import { API_URL } from '@/config/environment';

interface TrackedSkin {
    name: string;
    minWear: number;
    maxWear: number;
    forcedDiscount: number;
    minFadePercentage: number;
}

interface UserSettings {
    csfloatTracking: boolean; // Enable notifications for new items
    skinportTracking: boolean; // Auto-sync data with cloud storage
}

export function useUserDashboard() {
    const trackedSkins: Ref<TrackedSkin[]> = ref([]);
    const errorMessage: Ref<string> = ref(""); // Reactive variable for error messages
    const username: Ref<string> = ref("");
    const messageType: Ref<'success' | 'error'> = ref('error');
    const isSettingsModalOpen: Ref<boolean> = ref(false); // Modal state
    const isSettingsLoading: Ref<boolean> = ref(false); // Loading state for settings

    const userSettings: Ref<UserSettings> = ref({
        csfloatTracking: false,
        skinportTracking: false,
    });

    // Function to apply wantedSources preferences
    const applyWantedSourcesPreferences = (): void => {
        const wantedSources = localStorage.getItem('wantedSources');

        if (wantedSources) {
            const sourceValue = parseInt(wantedSources, 10);

            switch (sourceValue) {
                case 2:
                    // Only skinport tracking enabled selected
                    userSettings.value.csfloatTracking = false;
                    userSettings.value.skinportTracking = true;
                    break;
                case 3:
                    // Only csfloat tracking enabled selected
                    userSettings.value.csfloatTracking = true;
                    userSettings.value.skinportTracking = false;
                    break;
                case 1:
                    // Both options enabled
                    userSettings.value.csfloatTracking = true;
                    userSettings.value.skinportTracking = true;
                    break;
                default:
                    // Default case - only skinportTracking
                    userSettings.value.csfloatTracking = false;
                    userSettings.value.skinportTracking = true;
                    break;
            }
        }
    };

    const fetchCsrfTokenAndUserConfig = async (): Promise<void> => {
        try {
            const csrfResponse = await fetch(`${API_URL}/csrf-token`, {
                method: "GET",
                credentials: "include",
            });

            if (!csrfResponse.ok) {
                throw new Error("Failed to fetch CSRF token");
            }

            const csrfData = await csrfResponse.json();
            const csrfToken = csrfData.csrfToken;

            const configResponse = await fetch(
                `${API_URL}/getUserConfig`,
                {
                    method: "GET",
                    headers: {
                        "csrf-token": csrfToken,
                    },
                    credentials: "include",
                }
            );

            if (!configResponse.ok) {
                throw new Error("Failed to fetch user config");
            }

            interface ItemOfInterest {
                itemOfInterest: string;
                minWear: number;
                maxWear: number;
                forcedDiscount: number;
                minFadePercentage: number;
            }

            interface ConfigData {
                itemsOfInterest: ItemOfInterest[];
            }

            const configData: ConfigData = await configResponse.json();

            trackedSkins.value = configData.itemsOfInterest.map((item) => ({
                name: item.itemOfInterest,
                minWear: item.minWear,
                maxWear: item.maxWear,
                forcedDiscount: item.forcedDiscount,
                minFadePercentage: item.minFadePercentage
            }));
        } catch (error) {
            console.error("Error fetching user config:", error);
            errorMessage.value = "Failed to load tracked skins. Please try again later.";
            messageType.value = 'error';
        }
    };

    const stopTracking = async (skin: TrackedSkin): Promise<void> => {
        try {
            const csrfResponse = await fetch(`${API_URL}/csrf-token`, {
                method: "GET",
                credentials: "include",
            });

            if (!csrfResponse.ok) {
                throw new Error("Failed to fetch CSRF token");
            }

            const csrfData = await csrfResponse.json();
            const csrfToken = csrfData.csrfToken;

            const deleteResponse = await fetch(`${API_URL}/deleteSkin`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "csrf-token": csrfToken,
                },
                credentials: "include",
                body: JSON.stringify({
                    skinName: skin.name,
                    minFloat: skin.minWear,
                    maxFloat: skin.maxWear,
                }),
            });

            if (!deleteResponse.ok) {
                throw new Error("Failed to delete skin");
            }

            // Remove the skin from the local list on success
            trackedSkins.value = trackedSkins.value.filter(
                (trackedSkin) => trackedSkin.name !== skin.name
            );
            errorMessage.value = `Stopped tracking skin: ${skin.name}`;
            messageType.value = 'success';
            clearErrorMessages(); // Clear error message after a delay
        } catch (error) {
            console.error("Error stopping tracking for skin:", error);
            errorMessage.value = "Failed to stop tracking the skin. Please try again.";
            messageType.value = 'error';
            clearErrorMessages(); // Clear error message after a delay
        }
    };

    const clearErrorMessages = (): void => {
        // After 2.5 seconds, clear the message
        setTimeout(() => {
            errorMessage.value = ''; // Clear the message
        }, 2500);
    };

    const openSettingsModal = (): void => {
        isSettingsModalOpen.value = true;
    };

    const closeSettingsModal = (): void => {
        isSettingsModalOpen.value = false;
    };

    const handleSettingsSave = async (newSettings: UserSettings): Promise<void> => {
        isSettingsLoading.value = true;

        try {
            // First fetch CSRF token
            const csrfResponse = await fetch(`${API_URL}/csrf-token`, {
                method: "GET",
                credentials: "include",
            });

            if (!csrfResponse.ok) {
                throw new Error("Failed to fetch CSRF token");
            }

            const csrfData = await csrfResponse.json();
            const csrfToken = csrfData.csrfToken;

            // Convert boolean settings to wantedSources number
            let wantedSources: number;

            if (newSettings.csfloatTracking && newSettings.skinportTracking) {
                // Both options enabled
                wantedSources = 1;
            } else if (newSettings.csfloatTracking && !newSettings.skinportTracking) {
                // Only csfloat tracking enabled
                wantedSources = 3;
            } else if (!newSettings.csfloatTracking && newSettings.skinportTracking) {
                // Only skinport tracking enabled
                wantedSources = 2;
            } else {
                // Neither enabled - default to skinport only
                wantedSources = 2;
            }

            const settingsResponse = await fetch(`${API_URL}/skins/updateWantedSources`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "csrf-token": csrfToken,
                },
                credentials: "include",
                body: JSON.stringify({ wantedSources }),
            });

            if (!settingsResponse.ok) {
                throw new Error("Failed to save settings");
            }

            // Update local settings on success
            userSettings.value = { ...newSettings };
            errorMessage.value = "Settings saved successfully!";
            messageType.value = 'success';
            closeSettingsModal();
            clearErrorMessages();
        } catch (error) {
            console.error("Error saving settings:", error);
            errorMessage.value = "Failed to save settings. Please try again.";
            messageType.value = 'error';
            clearErrorMessages();
        } finally {
            isSettingsLoading.value = false;
        }
    };

    onMounted(() => {
        username.value = localStorage.getItem('username') || ""; // Get the stored username
        fetchCsrfTokenAndUserConfig();
        applyWantedSourcesPreferences(); // Apply localStorage preferences
    });

    return {
        trackedSkins,
        errorMessage,
        messageType,
        stopTracking,
        username,
        isSettingsModalOpen,
        isSettingsLoading,
        userSettings,
        openSettingsModal,
        closeSettingsModal,
        handleSettingsSave,
        applyWantedSourcesPreferences
    };
}