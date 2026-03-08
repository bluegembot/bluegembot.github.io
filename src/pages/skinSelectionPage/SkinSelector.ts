// SkinSelector.ts
import { ref, computed, watch, nextTick } from 'vue';
import type { Ref, ComputedRef } from 'vue';
import skinsJson from "@/assets/converted-skins.json";
import { API_URL } from '@/config/environment';

interface Skin {
    market_hash_name: string;
    image_url: string;
    condition: string;
    min_float: number;
    max_float: number;
    allowed_min_float: number;
    allowed_max_float: number;
    can_be_stattrak: boolean;
    can_be_souvenir: boolean;
    
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
    isStattrak: boolean;
    isSouvenir: boolean;
}

type WearTier = { label: Skin["condition"]; min: number; max: number };

const WEAR_TIERS: WearTier[] = [
  { label: "Factory new",   min: 0.00, max: 0.07 },
  { label: "Minimal wear",  min: 0.07, max: 0.15 },
  { label: "Field tested",  min: 0.15, max: 0.38 },
  { label: "Well worn",     min: 0.38, max: 0.45 },
  { label: "Battle scarred",min: 0.45, max: 1.00 },
];

export function useSkinSelector() {
    const searchQuery: Ref<string> = ref("");
    const skins: Ref<Skin[]> = ref([]);
    const displayedSkins: Ref<Skin[]> = ref([]);
    const errorMessage: Ref<string> = ref("");
    const modalErrorMessage: Ref<string> = ref("");
    const showAdvancedMenu: Ref<boolean> = ref(false);
    const messageType: Ref<'success' | 'error'> = ref('error');
    const showSubscriptionError: Ref<boolean> = ref(false);
    const selectedSkin: Ref<Skin | null> = ref(null);

    const advancedOptions: Ref<AdvancedOptions> = ref({
        statTrak: false,
        souvenir: false,
        minDiscount: 1,
        forceDiscount: false,
        minFadePercentage: 80,
        forceFadePercentage: false
    });

    const shouldShowFadeSlider: ComputedRef<boolean> = computed(() => {
        if (!selectedSkin.value) return false;

        const itemName = selectedSkin.value.market_hash_name.toLowerCase();
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

    type SkinJson = {
        market_hash_name: string;
        image_url: string;
        min_float: number;
        max_float: number;
        souvenir?: boolean;
        stattrak?: boolean;
        can_be_souvenir?: boolean;
        can_be_stattrak?: boolean;
    };

    function initializeSkins(): void {
    skins.value = (skinsJson as SkinJson[]).map((s) => {
        const allowedMin = s.min_float ?? 0;
        const allowedMax = s.max_float ?? 1;

        return {
        market_hash_name: s.market_hash_name,
        image_url: s.image_url,
        condition: "Factory new",
        min_float: 0,
        max_float: 0.07,
        allowed_min_float: allowedMin,
        allowed_max_float: allowedMax,
        can_be_souvenir: Boolean(s.can_be_souvenir ?? s.souvenir),
        can_be_stattrak: Boolean(s.can_be_stattrak ?? s.stattrak),
        };
    });
}

    initializeSkins();

    function normalizeTokens(s: string): string[] {
    return s
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    }

    function filterSkins(query: string): void {
    const qTokens = normalizeTokens(query);

    if (qTokens.length === 0) {
        displayedSkins.value = skins.value.slice(0, 50);
        return;
    }

    const filtered = skins.value.filter((skin) => {
        const name = (skin.market_hash_name ?? '').toLowerCase();

        return qTokens.every((t) => name.includes(t));
    });

    displayedSkins.value = filtered.slice(0, 50);
    }

    function getAvailableConditions(skin: Skin): WearTier[] {
        const allowedMin = clamp(skin.allowed_min_float ?? 0, 0, 1);
        const allowedMax = clamp(skin.allowed_max_float ?? 1, 0, 1);

        const minBound = Math.min(allowedMin, allowedMax);
        const maxBound = Math.max(allowedMin, allowedMax);

     // Tier is available if it overlaps the allowed range
    return WEAR_TIERS.filter((t) => maxBound > t.min && minBound < t.max);
}

    function getTierForCondition(condition: Skin["condition"]) {
    return WEAR_TIERS.find((t) => t.label === condition);
    }

    function getConditionBounds(skin: Skin): { min: number; max: number } {
    const allowedMin = clamp(skin.allowed_min_float ?? 0, 0, 1);
    const allowedMax = clamp(skin.allowed_max_float ?? 1, 0, 1);
    const minBound = Math.min(allowedMin, allowedMax);
    const maxBound = Math.max(allowedMin, allowedMax);

    const tier = getTierForCondition(skin.condition);
    if (!tier) return { min: minBound, max: maxBound };

    return {
        min: Math.max(minBound, tier.min),
        max: Math.min(maxBound, tier.max),
    };
    }

    function getMinBoundForCondition(skin: Skin): number {
    return getConditionBounds(skin).min;
    }

    function getMaxBoundForCondition(skin: Skin): number {
    return getConditionBounds(skin).max;
    }

    function updateFloats(skin: Skin): void {
    const available = getAvailableConditions(skin);

    if (!available.some((t) => t.label === skin.condition)) {
        skin.condition = available[0]?.label ?? "Factory new";
    }

    const bounds = getConditionBounds(skin);
    skin.min_float = bounds.min;
    skin.max_float = bounds.max;
    }

    function clamp(value: number, min: number, max: number): number {
    if (!Number.isFinite(value)) return min;
    return Math.min(max, Math.max(min, value));
    }

    function validateFloatInput(skin: Skin, field: "minFloat" | "maxFloat"): void {
    const bounds = getConditionBounds(skin);
        if (field === "minFloat") {
            skin.min_float = clamp(skin.min_float, bounds.min, bounds.max);
            if (skin.min_float > skin.max_float) {
            skin.max_float = skin.min_float;
            }
            skin.max_float = clamp(skin.max_float, bounds.min, bounds.max);
        } else {
            skin.max_float = clamp(skin.max_float, bounds.min, bounds.max);
            if (skin.max_float < skin.min_float) {
            skin.min_float = skin.max_float;
            }
            skin.min_float = clamp(skin.min_float, bounds.min, bounds.max);
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

    function applyAdvancedOptions(skin: Skin): void {
    if (!selectedSkin.value) return;

    if (advancedOptions.value.statTrak && advancedOptions.value.souvenir) {
        modalErrorMessage.value = "Cannot apply both Souvenir and StatTrak.";
        clearErrorMessages();
        return;
    }

    if (advancedOptions.value.souvenir && !skin.can_be_souvenir) {
        modalErrorMessage.value = "Souvenir cannot be applied.";
        clearErrorMessages();
        return;
    }

    if (advancedOptions.value.statTrak && !skin.can_be_stattrak) {
        modalErrorMessage.value = "StatTrak cannot be applied to your selected skin.";
        clearErrorMessages();
        return;
    }

    let advancedOption = "";
    if (advancedOptions.value.souvenir) advancedOption = "souvenir";
    else if (advancedOptions.value.statTrak) advancedOption = "stattrak";

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

        let finalSkinName = skin.market_hash_name

        if (advancedOption) {
            finalSkinName = `${finalSkinName}`;
        }

        return finalSkinName;
    }

    async function addSkin(skin: Skin, advancedOption: string = ""): Promise<void> {
        try {
            const finalSkinName = buildFinalSkinName(skin, advancedOption);

            const bounds = getConditionBounds(skin);
            skin.min_float = clamp(skin.min_float, bounds.min, bounds.max);
            skin.max_float = clamp(skin.max_float, bounds.min, bounds.max);
            if (skin.min_float > skin.max_float) skin.max_float = skin.min_float;

            const payload: AddSkinPayload = {
                skinName: finalSkinName,
                minFloat: skin.min_float,
                maxFloat: skin.max_float,
                minDiscount: advancedOptions.value.forceDiscount
                    ? advancedOptions.value.minDiscount
                    : false,
                minFadePercentage: advancedOptions.value.forceFadePercentage
                    ? advancedOptions.value.minFadePercentage
                    : false,
                isStattrak: advancedOption === "stattrak" || false,
                isSouvenir: advancedOption === "souvenir" || false
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
        return skin.market_hash_name
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
        formattedSkinName,
        getAvailableConditions,
        getTierForCondition,
        getMaxBoundForCondition,
        getMinBoundForCondition
    };
}
