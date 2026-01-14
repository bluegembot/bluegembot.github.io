// SkinSelector.ts
import { ref, computed, watch, nextTick } from 'vue';
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
    const showSubscriptionError: Ref<boolean> = ref(false);

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
            if (skin.minFloat < skin.allowedMinFloat) skin.minFloat = skin.allowedMinFloat;
            if (skin.minFloat > skin.allowedMaxFloat) skin.minFloat = skin.allowedMaxFloat;
            if (skin.minFloat < 0) skin.minFloat = 0;
            if (skin.minFloat > 1) skin.minFloat = 1;
        } else if (field === "maxFloat") {
            if (skin.maxFloat < skin.allowedMinFloat) skin.maxFloat = skin.allowedMinFloat;
            if (skin.maxFloat > skin.allowedMaxFloat) skin.maxFloat = skin.allowedMaxFloat;
            if (skin.maxFloat < 0) skin.maxFloat = 0;
            if (skin.maxFloat > 1) skin.maxFloat = 1;
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

    const showSubscriptionRequiredError = (): void => {
        nextTick(() => {
            closeMenu();
            showSubscriptionError.value = true;

            setTimeout(() => {
                showSubscriptionError.value = false;
            }, 10000);
        });
    };

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

    let cachedCsrfToken: string | null = null;

    async function getCsrfToken(): Promise<string> {
        if (cachedCsrfToken != null && cachedCsrfToken !== "") return cachedCsrfToken;

        const r = await fetch(`${API_URL}/csrf-token`, {
            method: "GET",
            credentials: "include",
        });

        if (!r.ok) {
            const err = await r.json().catch(() => ({}));
            throw new Error(err.message || "Failed to fetch CSRF token");
        }

        const data: any = await r.json();
        const token: string | undefined = data?.csrfToken;

        if (!token) throw new Error("CSRF token missing in response");

        cachedCsrfToken = token;
        return token;
    }

    function buildFinalSkinName(skin: Skin, advancedOption: string): string {
        const conditionSlug = skin.condition.toLowerCase().replace(" ", "-");

        let finalSkinName = skin.itemName
            .replace("factory-new", conditionSlug)
            .replace("minimal-wear", conditionSlug)
            .replace("field-tested", conditionSlug)
            .replace("battle-scarred", conditionSlug)
            .replace("well-worn", conditionSlug);

        if (advancedOption) {
            finalSkinName = `${advancedOption}-${finalSkinName}`;
        }

        return finalSkinName;
    }

    async function addSkin(skin: Skin, advancedOption: string = ""): Promise<void> {
        try {
            const finalSkinName = buildFinalSkinName(skin, advancedOption);

            const payload: AddSkinPayload = {
                skinName: finalSkinName,
                minFloat: skin.minFloat,
                maxFloat: skin.maxFloat,
                minDiscount: advancedOptions.value.forceDiscount
                    ? advancedOptions.value.minDiscount
                    : false,
                minFadePercentage: advancedOptions.value.forceFadePercentage
                    ? advancedOptions.value.minFadePercentage
                    : false,
            };

            const sendAddSkin = async (csrfToken: string) => {
                return fetch(`${API_URL}/addSkin`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-Token": csrfToken,
                    },
                    body: JSON.stringify(payload),
                    credentials: "include",
                });
            };

            let csrfToken = await getCsrfToken();
            let response = await sendAddSkin(csrfToken);

            if (response.status === 403) {
                cachedCsrfToken = null;
                csrfToken = await getCsrfToken();
                response = await sendAddSkin(csrfToken);
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(JSON.stringify(errorData));
            }

            const data = await response.json();

            errorMessage.value = data.message;
            messageType.value = "success";
            clearErrorMessages();
        } catch (error: any) {
            console.error("Error adding skin:", error);

            try {
                const errorData = JSON.parse(error.message);

                if (errorData.message && errorData.message.includes("Exceeded item limit")) {
                    showSubscriptionRequiredError();
                    return;
                }

                showErrorMessage(errorData.message || "Failed to add skin, please try again.");
            } catch {
                showErrorMessage("Failed to add skin, please try again.");
            }
        }
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
        showSubscriptionError,
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
