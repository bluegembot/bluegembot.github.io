//UserDashboardPage.ts
import {nextTick, onMounted, ref} from "vue";
import type { Ref } from "vue";
import { API_URL } from '@/config/environment';

interface TrackedSkin {
    name: string;
    minWear: number;
    maxWear: number;
    forcedDiscount: number | false;
    minFadePercentage: number | false;
    // Store original values for comparison
    _original?: {
        minWear: number;
        maxWear: number;
        forcedDiscount: number | false;
        minFadePercentage: number | false;
    };
}

interface UserSettings {
    csfloatTracking: boolean; // Enable notifications for new items
    skinportTracking: boolean; // Auto-sync data with cloud storage
}

interface UseUserDashboardReturn {
    trackedSkins: Ref<TrackedSkin[]>;
    errorMessage: Ref<string>;
    messageType: Ref<'success' | 'error'>;
    stopTracking: (skin: TrackedSkin) => Promise<void>;
    username: Ref<string>;
    isSettingsModalOpen: Ref<boolean>;
    isSettingsLoading: Ref<boolean>;
    userSettings: Ref<UserSettings>;
    openSettingsModal: () => void;
    closeSettingsModal: () => void;
    handleSettingsSave: (newSettings: UserSettings) => Promise<void>;
    applyWantedSourcesPreferences: () => void;
    showSubscriptionError: Ref<boolean>;
    navigateToSubscriptions: () => void;
    validateAndUpdateSkin: (skin: TrackedSkin, field: string) => Promise<void>;
    toggleForcedDiscount: (skin: TrackedSkin) => void;
    toggleMinFade: (skin: TrackedSkin) => void;
    updateSkinSettings: (skin: TrackedSkin) => Promise<void>;
    hasUnsavedChanges: (skin: TrackedSkin) => boolean;
    markSkinAsChanged: (skin: TrackedSkin) => void;
    submitChanges: (skin: TrackedSkin) => Promise<void>;
    cancelChanges: (skin: TrackedSkin) => void;
    isUpdating: Ref<boolean>;
}

// Validate skin inputs
const validateSkinInputs = (skin: TrackedSkin): void => {
    // Validate float range (0-1)
    if (skin.minWear < 0) skin.minWear = 0;
    if (skin.minWear > 1) skin.minWear = 1;
    if (skin.maxWear < 0) skin.maxWear = 0;
    if (skin.maxWear > 1) skin.maxWear = 1;

    // Ensure minWear <= maxWear
    if (skin.minWear > skin.maxWear) {
        skin.maxWear = skin.minWear;
    }

    // Validate percentages (0-100) and round to integers
    if (typeof skin.forcedDiscount === 'number') {
        if (skin.forcedDiscount < 0) skin.forcedDiscount = 0;
        if (skin.forcedDiscount > 100) skin.forcedDiscount = 100;
        skin.forcedDiscount = Math.round(skin.forcedDiscount);
    }

    if (typeof skin.minFadePercentage === 'number') {
        if (skin.minFadePercentage < 0) skin.minFadePercentage = 0;
        if (skin.minFadePercentage > 100) skin.minFadePercentage = 100;
        skin.minFadePercentage = Math.round(skin.minFadePercentage);
    }
};

export function useUserDashboard(): UseUserDashboardReturn {
    const trackedSkins: Ref<TrackedSkin[]> = ref([]);
    const errorMessage: Ref<string> = ref(""); // Reactive variable for error messages
    const username: Ref<string> = ref("");
    const messageType: Ref<'success' | 'error'> = ref('error');
    const isSettingsModalOpen: Ref<boolean> = ref(false); // Modal state
    const isSettingsLoading: Ref<boolean> = ref(false); // Loading state for settings
    const showSubscriptionError: Ref<boolean> = ref(false); // New reactive variable for subscription error
    const isUpdating: Ref<boolean> = ref(false); // Loading state for updating skins

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
                forcedDiscount: number | false;
                minFadePercentage: number | false;
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
                minFadePercentage: item.minFadePercentage,
                _original: {
                    minWear: item.minWear,
                    maxWear: item.maxWear,
                    forcedDiscount: item.forcedDiscount,
                    minFadePercentage: item.minFadePercentage
                }
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

    // Helper function to show subscription required message
    const showSubscriptionRequiredError = (): void => {
        // First reset the loading state
        isSettingsLoading.value = false;

        // Use nextTick to ensure the loading state is processed first
        nextTick(() => {
            // Close the modal
            closeSettingsModal();

            // Then show the subscription error
            showSubscriptionError.value = true;

            // Auto-hide after 10 seconds (longer since it has a button)
            setTimeout(() => {
                showSubscriptionError.value = false;
            }, 10000);
        });
    };

    // Helper function to show regular error messages
    const showErrorMessage = (message: string): void => {
        errorMessage.value = message;
        messageType.value = 'error';
        clearErrorMessages();
    };

    // Function to navigate to subscriptions page
    const navigateToSubscriptions = (): void => {
        window.location.href = 'https://bluegembot.github.io/#/subscriptions';
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
                // Parse the error response
                const errorData = await settingsResponse.json();

                // Handle specific error cases
                if (errorData.error === 'SUBSCRIPTION_REQUIRED') {
                    // Show subscription required message and close modal
                    showSubscriptionRequiredError();
                    return; // Don't continue with the rest of the function
                } else if (errorData.error === 'INVALID_SOURCE_VALUE') {
                    // Show invalid input message
                    isSettingsLoading.value = false;
                    showErrorMessage('Invalid source selection. Please try again.');
                    return;
                } else {
                    // Generic error message
                    isSettingsLoading.value = false;
                    showErrorMessage(errorData.message || 'Failed to save settings');
                    return;
                }
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

    // New functions for editable field functionality
    const validateAndUpdateSkin = async (skin: TrackedSkin, field: string): Promise<void> => {
        // This function is no longer needed since we use submitChanges instead
        // Keeping for compatibility if referenced elsewhere
        await submitChanges(skin);
    };

    const toggleForcedDiscount = (skin: TrackedSkin): void => {
        if (skin.forcedDiscount === false) {
            skin.forcedDiscount = 0;
        } else {
            skin.forcedDiscount = false;
        }
    };

    const toggleMinFade = (skin: TrackedSkin): void => {
        if (skin.minFadePercentage === false) {
            skin.minFadePercentage = 0;
        } else {
            skin.minFadePercentage = false;
        }
    };

    // Check if skin has unsaved changes
    const hasUnsavedChanges = (skin: TrackedSkin): boolean => {
        if (!skin._original) return false;

        return (
            skin.minWear !== skin._original.minWear ||
            skin.maxWear !== skin._original.maxWear ||
            skin.forcedDiscount !== skin._original.forcedDiscount ||
            skin.minFadePercentage !== skin._original.minFadePercentage
        );
    };

    // Mark skin as changed (this function can be used for additional logic if needed)
    const markSkinAsChanged = (skin: TrackedSkin): void => {
        // This function is called on input changes
        // Could be used for additional validation or UI feedback
    };

    // Validate and submit changes for a specific skin
    const submitChanges = async (skin: TrackedSkin): Promise<void> => {
        // Validate inputs before submitting
        validateSkinInputs(skin);

        // Submit the changes
        isUpdating.value = true;
        try {
            await updateSkinSettings(skin);

            // Update the original values after successful save
            if (skin._original) {
                skin._original.minWear = skin.minWear;
                skin._original.maxWear = skin.maxWear;
                skin._original.forcedDiscount = skin.forcedDiscount;
                skin._original.minFadePercentage = skin.minFadePercentage;
            }
        } finally {
            isUpdating.value = false;
        }
    };

    // Cancel changes and reset to original values
    const cancelChanges = (skin: TrackedSkin): void => {
        if (skin._original) {
            skin.minWear = skin._original.minWear;
            skin.maxWear = skin._original.maxWear;
            skin.forcedDiscount = skin._original.forcedDiscount;
            skin.minFadePercentage = skin._original.minFadePercentage;
        }
    };

    const updateSkinSettings = async (skin: TrackedSkin): Promise<void> => {
        try {
            // Fetch CSRF token
            const csrfResponse = await fetch(`${API_URL}/csrf-token`, {
                method: "GET",
                credentials: "include",
            });

            if (!csrfResponse.ok) {
                throw new Error("Failed to fetch CSRF token");
            }

            const csrfData = await csrfResponse.json();
            const csrfToken = csrfData.csrfToken;

            // Update skin settings via API
            const updateResponse = await fetch(`${API_URL}/updateSkinSettings`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "csrf-token": csrfToken,
                },
                credentials: "include",
                body: JSON.stringify({
                    skinName: skin.name,
                    minWear: skin.minWear,
                    maxWear: skin.maxWear,
                    forcedDiscount: skin.forcedDiscount,
                    minFadePercentage: skin.minFadePercentage
                }),
            });

            if (!updateResponse.ok) {
                throw new Error("Failed to update skin settings");
            }

            // Show success message
            errorMessage.value = `Updated settings for ${skin.name}`;
            messageType.value = 'success';
            clearErrorMessages();
        } catch (error) {
            console.error('Failed to update skin settings:', error);
            errorMessage.value = "Failed to update skin settings. Please try again.";
            messageType.value = 'error';
            clearErrorMessages();
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
        applyWantedSourcesPreferences,
        showSubscriptionError,
        navigateToSubscriptions,
        validateAndUpdateSkin,
        toggleForcedDiscount,
        toggleMinFade,
        updateSkinSettings,
        hasUnsavedChanges,
        markSkinAsChanged,
        submitChanges,
        cancelChanges,
        isUpdating
    };
}