//UserDashboardPage.ts
import {nextTick, onMounted, ref} from "vue";
import type { Ref } from "vue";
import { API_URL } from '@/config/environment';
import { csrfFetch } from "@/api/csrf";

interface TrackedSkin {
    name: string;
    minWear: number;
    maxWear: number;
    forcedDiscount: number;
    minFadePercentage: number;
    // Store original values for comparison
    _original?: {
        minWear: number;
        maxWear: number;
        forcedDiscount: number;
        minFadePercentage: number;
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
    // Add these three missing function signatures:
    validateFloatInput: (skin: TrackedSkin, field: 'minWear' | 'maxWear') => void;
    validateSkinInputs: (skin: TrackedSkin) => void;
    getAllowedFloatRange: (skinName: string) => { minFloat: number, maxFloat: number } | null;
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
    if (skin.forcedDiscount < 0) skin.forcedDiscount = 0;
    if (skin.forcedDiscount > 100) skin.forcedDiscount = 100;
    skin.forcedDiscount = Math.round(skin.forcedDiscount);

    if (skin.minFadePercentage < 0) skin.minFadePercentage = 0;
    if (skin.minFadePercentage > 100) skin.minFadePercentage = 100;
    skin.minFadePercentage = Math.round(skin.minFadePercentage);
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

    // Float ranges for different wear conditions
    const floatRanges: Record<string, { minFloat: number, maxFloat: number }> = {
        "factory-new": { minFloat: 0, maxFloat: 0.07 },
        "minimal-wear": { minFloat: 0.07, maxFloat: 0.15 },
        "field-tested": { minFloat: 0.15, maxFloat: 0.38 },
        "well-worn": { minFloat: 0.38, maxFloat: 0.45 },
        "battle-scarred": { minFloat: 0.45, maxFloat: 1 },
    };

    // Function to extract condition from skin name
    const getConditionFromSkinName = (skinName: string): string | null => {
        const lowerName = skinName.toLowerCase();

        if (lowerName.includes('factory-new')) return 'factory-new';
        if (lowerName.includes('minimal-wear')) return 'minimal-wear';
        if (lowerName.includes('field-tested')) return 'field-tested';
        if (lowerName.includes('well-worn')) return 'well-worn';
        if (lowerName.includes('battle-scarred')) return 'battle-scarred';

        return null;
    };

    // Function to get allowed float range for a skin
    const getAllowedFloatRange = (skinName: string): { minFloat: number, maxFloat: number } | null => {
        const condition = getConditionFromSkinName(skinName);
        return condition ? floatRanges[condition] : null;
    };

    // Validation function for float inputs (similar to skin selector)
    const validateFloatInput = (skin: TrackedSkin, field: 'minWear' | 'maxWear'): void => {
        const allowedRange = getAllowedFloatRange(skin.name);

        if (!allowedRange) {
            // If we can't determine the condition, apply basic 0-1 validation
            if (field === "minWear") {
                if (skin.minWear < 0) skin.minWear = 0;
                if (skin.minWear > 1) skin.minWear = 1;
            } else if (field === "maxWear") {
                if (skin.maxWear < 0) skin.maxWear = 0;
                if (skin.maxWear > 1) skin.maxWear = 1;
            }
            return;
        }

        if (field === "minWear") {
            // Ensure minWear is within the allowed range for the condition
            if (skin.minWear < allowedRange.minFloat) {
                skin.minWear = allowedRange.minFloat;
            }
            if (skin.minWear > allowedRange.maxFloat) {
                skin.minWear = allowedRange.maxFloat;
            }
            // Basic 0-1 validation
            if (skin.minWear < 0) {
                skin.minWear = 0;
            }
            if (skin.minWear > 1) {
                skin.minWear = 1;
            }
            // Ensure minWear doesn't exceed maxWear
            if (skin.minWear > skin.maxWear) {
                skin.maxWear = skin.minWear;
            }
        } else if (field === "maxWear") {
            // Ensure maxWear is within the allowed range for the condition
            if (skin.maxWear < allowedRange.minFloat) {
                skin.maxWear = allowedRange.minFloat;
            }
            if (skin.maxWear > allowedRange.maxFloat) {
                skin.maxWear = allowedRange.maxFloat;
            }
            // Basic 0-1 validation
            if (skin.maxWear < 0) {
                skin.maxWear = 0;
            }
            if (skin.maxWear > 1) {
                skin.maxWear = 1;
            }
            // Ensure maxWear doesn't go below minWear
            if (skin.maxWear < skin.minWear) {
                skin.minWear = skin.maxWear;
            }
        }
    };

    // Complete skin validation function
    const validateSkinInputs = (skin: TrackedSkin): void => {
        // Validate float inputs
        validateFloatInput(skin, 'minWear');
        validateFloatInput(skin, 'maxWear');

        // Validate forced discount if enabled
        if (skin.forcedDiscount > 0) {
            if (skin.forcedDiscount < 1) {
                skin.forcedDiscount = 1;
            }
            if (skin.forcedDiscount > 100) {
                skin.forcedDiscount = 100;
            }
        }

        // Validate min fade percentage if enabled
        if (skin.minFadePercentage > 0) {
            if (skin.minFadePercentage < 0) {
                skin.minFadePercentage = 0;
            }
            if (skin.minFadePercentage > 100) {
                skin.minFadePercentage = 100;
            }
        }
    };

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
            const configResponse = await fetch(`${API_URL}/getUserConfig`, {
                method: "GET",
                credentials: "include",
            });

            if (!configResponse.ok) {
                throw new Error("Failed to fetch user config");
            }

            interface ItemOfInterest {
                item_of_interest: string;
                min_wear: number;
                max_wear: number;
                forced_discount: number;
                forced_fade_percentage: number;
            }

            interface ConfigData {
                itemsOfInterest: ItemOfInterest[];
            }

            const configData: ConfigData = await configResponse.json();

            trackedSkins.value = configData.itemsOfInterest.map((item) => ({
                name: item.item_of_interest,
                minWear: item.min_wear,
                maxWear: item.max_wear,
                forcedDiscount: item.forced_discount,
                minFadePercentage: item.forced_fade_percentage,
                _original: {
                    minWear: item.min_wear,
                    maxWear: item.max_wear,
                    forcedDiscount: item.forced_discount,
                    minFadePercentage: item.forced_fade_percentage,
                },
            }));
        } catch (error) {
            console.error("Error fetching user config:", error);
            errorMessage.value = "Failed to load tracked skins. Please try again later.";
            messageType.value = "error";
        }
    };

    const stopTracking = async (skin: TrackedSkin): Promise<void> => {
        try {
            const deleteResponse = await csrfFetch(`${API_URL}/deleteSkin`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    skinName: skin.name,
                    minFloat: skin.minWear,
                    maxFloat: skin.maxWear,
                }),
            });

            if (!deleteResponse.ok) {
                const errorData = await deleteResponse.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to delete skin");
            }

            trackedSkins.value = trackedSkins.value.filter(
                (trackedSkin) => trackedSkin.name !== skin.name
            );

            errorMessage.value = `Stopped tracking skin: ${skin.name}`;
            messageType.value = "success";
            clearErrorMessages();
        } catch (error) {
            console.error("Error stopping tracking for skin:", error);
            errorMessage.value = "Failed to stop tracking the skin. Please try again.";
            messageType.value = "error";
            clearErrorMessages();
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
            const wantedSources =
                newSettings.csfloatTracking && newSettings.skinportTracking
                    ? 1
                    : newSettings.csfloatTracking && !newSettings.skinportTracking
                        ? 3
                        : !newSettings.csfloatTracking && newSettings.skinportTracking
                            ? 2
                            : 2;

            const settingsResponse = await csrfFetch(`${API_URL}/skins/updateWantedSources`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ wantedSources }),
            });

            if (!settingsResponse.ok) {
                const errorData = await settingsResponse.json().catch(() => ({}));

                if (errorData.error === "SUBSCRIPTION_REQUIRED") {
                    showSubscriptionRequiredError();
                    return;
                }

                if (errorData.error === "INVALID_SOURCE_VALUE") {
                    showErrorMessage("Invalid source selection. Please try again.");
                    return;
                }

                showErrorMessage(errorData.message || "Failed to save settings");
                return;
            }

            userSettings.value = { ...newSettings };
            errorMessage.value = "Settings saved successfully!";
            messageType.value = "success";
            closeSettingsModal();
            clearErrorMessages();
        } catch (error) {
            console.error("Error saving settings:", error);
            errorMessage.value = "Failed to save settings. Please try again.";
            messageType.value = "error";
            clearErrorMessages();
        } finally {
            isSettingsLoading.value = false;
        }
    };

    // New functions for editable field functionality
    const validateAndUpdateSkin = async (skin: TrackedSkin): Promise<void> => {
        // This function is no longer needed since we use submitChanges instead
        // Keeping for compatibility if referenced elsewhere
        await submitChanges(skin);
    };

    const toggleForcedDiscount = (skin: TrackedSkin): void => {
        if (skin.forcedDiscount > 0) {
            skin.forcedDiscount = 0;
        } else {
            skin.forcedDiscount = 0;
        }
    };

    const toggleMinFade = (skin: TrackedSkin): void => {
        if (skin.minFadePercentage === 0) {
            skin.minFadePercentage = 0;
        } else {
            skin.minFadePercentage = 1;
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

    // Mark skin as changed and apply validation
    const markSkinAsChanged = (skin: TrackedSkin, field?: 'minWear' | 'maxWear'): void => {
        // Apply validation when a field is changed
        if (field) {
            validateFloatInput(skin, field);
        } else {
            // If no specific field is provided, validate all inputs
            validateSkinInputs(skin);
        }
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
            const updateResponse = await csrfFetch(`${API_URL}/updateSkinSettings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    itemOfInterest: skin.name,
                    minWear: skin.minWear,
                    maxWear: skin.maxWear,
                    forcedDiscount: skin.forcedDiscount,
                    minFadePercentage: skin.minFadePercentage,
                }),
            });

            if (!updateResponse.ok) {
                const errorData = await updateResponse.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to update skin settings");
            }

            errorMessage.value = `Updated settings for ${skin.name}`;
            messageType.value = "success";
            clearErrorMessages();
        } catch (error) {
            console.error("Failed to update skin settings:", error);
            errorMessage.value = "Failed to update skin settings. Please try again.";
            messageType.value = "error";
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
        isUpdating,
        validateFloatInput, // Export for use in components
        validateSkinInputs,  // Export for use in components
        getAllowedFloatRange // Export for displaying allowed ranges in UI
    };
}