//UserDashboardPage.ts
import {computed, nextTick, onMounted, ref} from "vue";
import type { ComputedRef, Ref } from "vue";
import { API_URL } from '@/config/environment';
import { csrfFetch } from "@/api/csrf";
import skinsJson from "@/assets/converted-skins.json";
import skinPlaceholder from "@/assets/SkinPlaceholder.svg";

interface SkinDatasetItem {
    market_hash_name: string;
    image_url: string;
    min_float?: number;
    max_float?: number;
    phase?: string;
}

const stripVariantPrefix = (itemName: string): string => {
    return itemName
        .trim()
        .replace(/^★\s*StatTrak™\s+/i, '★ ')
        .replace(/^StatTrak™\s+/i, '')
        .replace(/^Souvenir\s+/i, '');
};

const getImageLookupName = (itemName: string): string => {
    return stripVariantPrefix(itemName).toLowerCase();
};

// item_of_interest is the only field the backend reliably persists as typed by the
// user, so StatTrak/Souvenir status is derived from its "StatTrak™ "/"Souvenir "
// prefix rather than trusted from the (currently unset) is_stattrak/is_souvenir columns.
const detectVariantFromName = (itemName: string): { isStattrak: boolean; isSouvenir: boolean } => {
    const trimmed = itemName.trim();

    if (/^(★\s*)?StatTrak™\s+/i.test(trimmed)) {
        return { isStattrak: true, isSouvenir: false };
    }

    if (/^Souvenir\s+/i.test(trimmed)) {
        return { isStattrak: false, isSouvenir: true };
    }

    return { isStattrak: false, isSouvenir: false };
};

// Doppler-style skins share a market_hash_name and differ by phase, so the
// map is keyed on "name|phase" with a phaseless fallback per name.
const skinDataMap = new Map<string, SkinDatasetItem>();
for (const skin of skinsJson as SkinDatasetItem[]) {
    const name = getImageLookupName(skin.market_hash_name);
    const phase = (skin.phase ?? '').toLowerCase();
    skinDataMap.set(`${name}|${phase}`, skin);
    if (!skinDataMap.has(`${name}|`)) {
        skinDataMap.set(`${name}|`, skin);
    }
}

const getSkinDatasetEntry = (name: string, phase: string | null): SkinDatasetItem | null => {
    const lookupName = getImageLookupName(name);
    const lookupPhase = (phase ?? '').toLowerCase();
    return skinDataMap.get(`${lookupName}|${lookupPhase}`)
        ?? skinDataMap.get(`${lookupName}|`)
        ?? null;
};

interface WearBadge {
    label: string;
    color: string;
}

const WEAR_BADGE_TIERS: Array<{ name: string; short: string; min: number; max: number; color: string }> = [
    { name: "Factory New", short: "FN", min: 0, max: 0.07, color: "#22c55e" },
    { name: "Minimal Wear", short: "MW", min: 0.07, max: 0.15, color: "#84cc16" },
    { name: "Field-Tested", short: "FT", min: 0.15, max: 0.38, color: "#eab308" },
    { name: "Well-Worn", short: "WW", min: 0.38, max: 0.45, color: "#f97316" },
    { name: "Battle-Scarred", short: "BS", min: 0.45, max: 1, color: "#ef4444" },
];

// A tracked range usually sits inside one wear tier (the selector bounds it
// that way), but hand-edited ranges can span several — show the span then.
const getWearBadge = (minWear: number, maxWear: number): WearBadge | null => {
    if (!Number.isFinite(minWear) || !Number.isFinite(maxWear) || minWear > maxWear) {
        return null;
    }

    const overlapping = WEAR_BADGE_TIERS.filter(
        (tier) => maxWear > tier.min && minWear < tier.max
    );

    if (overlapping.length === 0) return null;

    if (overlapping.length === 1) {
        return { label: overlapping[0].name, color: overlapping[0].color };
    }

    return {
        label: `${overlapping[0].short} – ${overlapping[overlapping.length - 1].short}`,
        color: overlapping[0].color,
    };
};

interface TrackedSkin {
    name: string;
    imageUrl: string | null;
    allowedMinFloat: number;
    allowedMaxFloat: number;
    minWear: number;
    maxWear: number;
    forcedDiscount: number;
    minFadePercentage: number;
    phase: string | null;
    // Store original values for comparison
    _original?: {
        minWear: number;
        maxWear: number;
        forcedDiscount: number;
        minFadePercentage: number;
        phase: string | null
    };
}

interface UserSettings {
    csfloatTracking: boolean; // Enable notifications for new items
    skinportTracking: boolean; // Auto-sync data with cloud storage
}

interface UseUserDashboardReturn {
    trackedSkins: Ref<TrackedSkin[]>;
    filteredTrackedSkins: ComputedRef<TrackedSkin[]>;
    skinSearchQuery: Ref<string>;
    isLoadingSkins: Ref<boolean>;
    getWearBadge: (minWear: number, maxWear: number) => WearBadge | null;
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
    getDisplayName: (skin: TrackedSkin) => string;
    skinPlaceholder: string;
    onImageError: (event: Event) => void;
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
    const skinSearchQuery: Ref<string> = ref("");
    const isLoadingSkins: Ref<boolean> = ref(true);
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

    const filteredTrackedSkins: ComputedRef<TrackedSkin[]> = computed(() => {
        const query = skinSearchQuery.value.trim().toLowerCase();
        if (query === "") return trackedSkins.value;

        const tokens = query.split(/\s+/).filter(Boolean);
        return trackedSkins.value.filter((skin) => {
            const haystack = `${skin.name} ${skin.phase ?? ''}`.toLowerCase();
            return tokens.every((token) => haystack.includes(token));
        });
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

    // skin.name keeps the raw StatTrak™/Souvenir prefix (it's what's sent back to the
    // backend to identify the row), so strip it only for what's shown on screen.
    const getDisplayName = (skin: TrackedSkin): string => {
        return stripVariantPrefix(skin.name);
    };

    const onImageError = (event: Event): void => {
        const img = event.target as HTMLImageElement;
        img.onerror = null;
        img.src = skinPlaceholder;
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

    // Function to apply wantedSources preferences.
    // Skinport tracking has been retired, so CSFloat is now the only source.
    // Any stored value (including legacy 1/2 that enabled Skinport) is normalized to CSFloat-only.
    const applyWantedSourcesPreferences = (): void => {
        userSettings.value.csfloatTracking = true;
        userSettings.value.skinportTracking = false;
    };

    const fetchCsrfTokenAndUserConfig = async (): Promise<void> => {
        isLoadingSkins.value = true;
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
                is_stattrak: boolean;
                is_souvenir: boolean;
                phase: string | null;
            }            

            interface ConfigData {
                itemsOfInterest: ItemOfInterest[];
            }

            const configData: ConfigData = await configResponse.json();

            trackedSkins.value = configData.itemsOfInterest.map((item) => {
                const datasetEntry = getSkinDatasetEntry(item.item_of_interest, item.phase || null);
                const variant = detectVariantFromName(item.item_of_interest);
                const itemIsStattrak = Boolean(item.is_stattrak) || variant.isStattrak;
                const itemIsSouvenir = Boolean(item.is_souvenir) || variant.isSouvenir;

                return {
                    name: item.item_of_interest,
                    imageUrl: datasetEntry?.image_url ?? null,
                    allowedMinFloat: datasetEntry?.min_float ?? 0,
                    allowedMaxFloat: datasetEntry?.max_float ?? 1,
                    minWear: item.min_wear,
                    maxWear: item.max_wear,
                    forcedDiscount: item.forced_discount,
                    minFadePercentage: item.forced_fade_percentage,
                    itemIsStattrak,
                    itemIsSouvenir,
                    phase: item.phase || null,
                    _original: {
                        minWear: item.min_wear,
                        maxWear: item.max_wear,
                        forcedDiscount: item.forced_discount,
                        minFadePercentage: item.forced_fade_percentage,
                        itemIsStattrak,
                        itemIsSouvenir,
                        phase: item.phase || null
                    },
                };
            });
        } catch (error) {
            console.error("Error fetching user config:", error);
            errorMessage.value = "Failed to load tracked skins. Please try again later.";
            messageType.value = "error";
        } finally {
            isLoadingSkins.value = false;
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

            // Match the same (name, minWear, maxWear) triple the backend used to find
            // the row to delete — filtering on name alone would also drop other tracked
            // items that happen to share the same name but different float ranges.
            trackedSkins.value = trackedSkins.value.filter(
                (trackedSkin) =>
                    !(
                        trackedSkin.name === skin.name &&
                        trackedSkin.minWear === skin.minWear &&
                        trackedSkin.maxWear === skin.maxWear
                    )
            );

            errorMessage.value = `Stopped tracking skin: ${getDisplayName(skin)}`;
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
            // Skinport tracking has been retired; CSFloat (value 3) is the only supported source.
            const wantedSources = 3;

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

            userSettings.value = { ...newSettings, csfloatTracking: true, skinportTracking: false };
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

            errorMessage.value = `Updated settings for ${getDisplayName(skin)}`;
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
        filteredTrackedSkins,
        skinSearchQuery,
        isLoadingSkins,
        getWearBadge,
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
        validateFloatInput,
        validateSkinInputs,
        getAllowedFloatRange,
        getDisplayName,
        skinPlaceholder,
        onImageError
    };
}