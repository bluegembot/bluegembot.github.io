//SkinSelector.ts
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import type { Ref, ComputedRef } from 'vue';
import skinsJson from "@/assets/skins.json";
import { API_URL } from '@/config/environment';

interface Skin {
    itemName: string;
    imageUrl: string;
    condition: string;
    minFloat: number;
    maxFloat: number;
    allowedMinFloat: number;
    allowedMaxFloat: number;
}

interface AdvancedOptions {
    statTrak: boolean;
    souvenir: boolean;
    minDiscount: number;
    forceDiscount: boolean;
    minFadePercentage: number;
    forceFadePercentage: boolean;
}

interface AddSkinPayload {
    skinName: string;
    minFloat: number;
    maxFloat: number;
    minDiscount: number | boolean;
    minFadePercentage: number | boolean;
}

export function useSkinSelector() {
    const searchQuery: Ref<string> = ref("");
    const skins: Ref<Skin[]> = ref([]);
    const displayedSkins: Ref<Skin[]> = ref([]);
    const errorMessage: Ref<string> = ref("");
    const modalErrorMessage: Ref<string> = ref("");
    const showAdvancedMenu: Ref<boolean> = ref(false);
    const messageType: Ref<'success' | 'error'> = ref('error');
    const showSubscriptionError: Ref<boolean> = ref(false); // Add subscription error state

    const advancedOptions: Ref<AdvancedOptions> = ref({
        statTrak: false,
        souvenir: false,
        minDiscount: 1,
        forceDiscount: false,
        minFadePercentage: 80,
        forceFadePercentage: false
    });

    const selectedSkin: Ref<Skin | null> = ref(null);

    const shouldShowFadeSlider: ComputedRef<boolean> = computed(() => {
        if (!selectedSkin.value) return false;

        const itemName = selectedSkin.value.itemName.toLowerCase();
        return itemName.includes('fade') &&
            !itemName.includes('marble') &&
            !itemName.includes('amber') &&
            !itemName.includes('crossfade');
    });

    watch(searchQuery, (newQuery) => {
        if (newQuery.trim() === "") {
            displayedSkins.value = [];
        } else {
            filterSkins(newQuery);
        }
    });

    // Initialize the skins when the composable is used
    function initializeSkins(): void {
        skins.value = skinsJson.map((skin: any) => ({
            ...skin,
            condition: "Factory new",
            minFloat: 0,
            maxFloat: 0.07,
            allowedMinFloat: 0,
            allowedMaxFloat: 0.07,
        }));
    }

    // Call initialization immediately
    initializeSkins();

    function filterSkins(query: string): void {
        const formattedQuery = query.trim().toLowerCase().replace(/\s+/g, '-');
        const filtered = skins.value.filter((skin) =>
            skin.itemName.toLowerCase().includes(formattedQuery)
        );
        displayedSkins.value = filtered.slice(0, 50);
    }

    function updateFloats(skin: Skin): void {
        const floatRanges: Record<string, { minFloat: number, maxFloat: number }> = {
            "Factory new": { minFloat: 0, maxFloat: 0.07 },
            "Minimal wear": { minFloat: 0.07, maxFloat: 0.15 },
            "Field tested": { minFloat: 0.15, maxFloat: 0.38 },
            "Well worn": { minFloat: 0.38, maxFloat: 0.45 },
            "Battle scarred": { minFloat: 0.45, maxFloat: 1 },
        };

        const selectedCondition = floatRanges[skin.condition];
        if (selectedCondition) {
            skin.minFloat = selectedCondition.minFloat;
            skin.maxFloat = selectedCondition.maxFloat;
            skin.allowedMinFloat = selectedCondition.minFloat;
            skin.allowedMaxFloat = selectedCondition.maxFloat;
        }
    }

    function validateFloatInput(skin: Skin, field: 'minFloat' | 'maxFloat'): void {
        if (field === "minFloat") {
            if (skin.minFloat < skin.allowedMinFloat) {
                skin.minFloat = skin.allowedMinFloat;
            }
            if (skin.minFloat > skin.allowedMaxFloat) {
                skin.minFloat = skin.allowedMaxFloat;
            }
            if (skin.minFloat < 0) {
                skin.minFloat = 0;
            }
            if (skin.minFloat > 1) {
                skin.minFloat = 1;
            }
        } else if (field === "maxFloat") {
            if (skin.maxFloat < skin.allowedMinFloat) {
                skin.maxFloat = skin.allowedMinFloat;
            }
            if (skin.maxFloat > skin.allowedMaxFloat) {
                skin.maxFloat = skin.allowedMaxFloat;
            }
            if (skin.maxFloat < 0) {
                skin.maxFloat = 0;
            }
            if (skin.maxFloat > 1) {
                skin.maxFloat = 1;
            }
        }
    }

    function openMenu(skin: Skin): void {
        selectedSkin.value = skin;
        showAdvancedMenu.value = true;
    }

    function closeMenu(): void {
        selectedSkin.value = null;
        showAdvancedMenu.value = false;
        modalErrorMessage.value = "";
    }

    // Helper function to show subscription required error
    const showSubscriptionRequiredError = (): void => {
        // Use nextTick to ensure any modal states are processed first
        nextTick(() => {
            // Close any open modals
            closeMenu();

            // Show the subscription error
            showSubscriptionError.value = true;

            // Auto-hide after 10 seconds
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

    function applyAdvancedOptions(): void {
        if (!selectedSkin.value) return;

        if (advancedOptions.value.statTrak && advancedOptions.value.souvenir) {
            modalErrorMessage.value = "Cannot apply both Souvenir and StatTrak.";
            clearErrorMessages();
            return;
        }

        const restrictedSouvenirKeywords = ["gloves", "hand-wraps", "knife", "karambit", "bayonet", "m9-bayonet", "shadow-daggers", "m4a1-s-fade"];
        const containsRestrictedSouvenirKeyword = restrictedSouvenirKeywords.some(keyword =>
            selectedSkin.value?.itemName.toLowerCase().includes(keyword)
        );

        const restrictedStatTrakKeywords = ["heat-treated", "gloves", "dragon-lore", "medusa", "m4a1-s-fade", "hand-wraps"];
        const containsRestrictedStatTrakKeyword = restrictedStatTrakKeywords.some(keyword =>
            selectedSkin.value?.itemName.toLowerCase().includes(keyword)
        );

        if (advancedOptions.value.souvenir && containsRestrictedSouvenirKeyword) {
            modalErrorMessage.value = "Souvenir cannot be applied to gloves, hand-wraps, or knives.";
            clearErrorMessages();
            return;
        }

        if (advancedOptions.value.statTrak && containsRestrictedStatTrakKeyword) {
            modalErrorMessage.value = "Stat trak cannot be applied to your selected skin";
            clearErrorMessages();
            return;
        }

        let advancedOption = "";
        if (advancedOptions.value.souvenir) {
            advancedOption = "souvenir";
        } else if (advancedOptions.value.statTrak) {
            advancedOption = "stattrak";
        }

        addSkin(selectedSkin.value, advancedOption);
        closeMenu();
    }

    function addSkin(skin: Skin, advancedOption: string = ""): void {
        let finalSkinName = skin.itemName
            .replace('factory-new', skin.condition.toLowerCase().replace(' ', '-'))
            .replace('minimal-wear', skin.condition.toLowerCase().replace(' ', '-'))
            .replace('field-tested', skin.condition.toLowerCase().replace(' ', '-'))
            .replace('battle-scarred', skin.condition.toLowerCase().replace(' ', '-'))
            .replace('well-worn', skin.condition.toLowerCase().replace(' ', '-'));

        if (advancedOption) {
            finalSkinName = `${advancedOption}-${finalSkinName}`;
        }

        const payload: AddSkinPayload = {
            skinName: finalSkinName,
            minFloat: skin.minFloat,
            maxFloat: skin.maxFloat,
            minDiscount: advancedOptions.value.forceDiscount ? advancedOptions.value.minDiscount : false,
            minFadePercentage: advancedOptions.value.forceFadePercentage ? advancedOptions.value.minFadePercentage : false
        };

        fetch(`${API_URL}/csrf-token`, {
            method: "GET",
            credentials: "include",
        })
            .then((response) => response.json())
            .then((data) => {
                const csrfToken = data.csrfToken;

                fetch(`${API_URL}/addSkin`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "csrf-token": csrfToken,
                    },
                    body: JSON.stringify(payload),
                    credentials: "include",
                })
                    .then((response) => {
                        if (!response.ok) {
                            return response.json().then(errorData => {
                                throw new Error(JSON.stringify(errorData));
                            });
                        }
                        return response.json();
                    })
                    .then((data) => {
                        errorMessage.value = data.message;
                        messageType.value = "success";
                        clearErrorMessages();
                    })
                    .catch((error) => {
                        console.error("Error adding skin:", error);

                        // Try to parse the error message
                        try {
                            const errorData = JSON.parse(error.message);

                            // Check if the error message indicates item limit exceeded
                            if (errorData.message && errorData.message.includes("Exceeded item limit")) {
                                showSubscriptionRequiredError();
                                return;
                            }

                            // Handle other specific error cases if needed
                            showErrorMessage(errorData.message || "Failed to add skin, please try again.");
                        } catch (parseError) {
                            // If parsing fails, show generic error
                            showErrorMessage("Failed to add skin, please try again.");
                        }
                    });
            })
            .catch((error) => {
                console.error("Error fetching CSRF token:", error);
                showErrorMessage("Internal server error, please try again.");
            });
    }

    function clearErrorMessages(): void {
        setTimeout(() => {
            errorMessage.value = '';
            modalErrorMessage.value = '';
        }, 2500);
    }

    function formattedSkinName(skin: Skin): string {
        return skin.itemName
            .replace(/-/g, ' ')
            .replace(/factory new/g, '')
            .replace(/minimal wear/g, '')
            .replace(/field tested/g, '')
            .replace(/battle scarred/g, '')
            .replace(/well worn/g, '');
    }

    return {
        searchQuery,
        displayedSkins,
        errorMessage,
        modalErrorMessage,
        showAdvancedMenu,
        advancedOptions,
        selectedSkin,
        messageType,
        shouldShowFadeSlider,
        showSubscriptionError, // Export the new subscription error state
        filterSkins,
        updateFloats,
        validateFloatInput,
        openMenu,
        closeMenu,
        applyAdvancedOptions,
        addSkin,
        clearErrorMessages,
        formattedSkinName
    };
}