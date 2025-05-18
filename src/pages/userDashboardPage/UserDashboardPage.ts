import { onMounted, ref, Ref } from "vue";
import { API_URL } from '@/config/environment';

interface TrackedSkin {
    name: string;
    minWear: number;
    maxWear: number;
    forcedDiscount: number;
    minFadePercentage: number;
}

export function useUserDashboard() {
    const trackedSkins: Ref<TrackedSkin[]> = ref([]);
    const errorMessage: Ref<string> = ref(""); // Reactive variable for error messages
    const username: Ref<string> = ref("");
    const messageType: Ref<'success' | 'error'> = ref('error');

    onMounted(() => {
        username.value = localStorage.getItem('username') || ""; // Get the stored username
        console.log(username.value);
    });

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

    onMounted(fetchCsrfTokenAndUserConfig);

    return {
        trackedSkins,
        errorMessage,
        messageType,
        stopTracking,
        username
    };
}