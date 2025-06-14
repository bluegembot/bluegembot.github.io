import { defineComponent, onMounted, ref, computed } from "vue";
import { API_URL } from '@/config/environment';

interface Subscription {
    title: string;
    perks: string[];
}

interface SubscriptionsPage {
    [key: string]: Subscription;
}

export default defineComponent({
    setup() {
        const username = ref("");
        const chatId = ref("");
        const subscriptionStatus = ref("");
        const errorMessage = ref("");
        const messageType = ref(""); // Added missing messageType ref
        const popupVisible = ref(false);
        const selectedSubscription = ref('');

        const clearErrorMessages = () => {
            setTimeout(() => {
                errorMessage.value = '';
            }, 2500);
        };

        const requestSubscriptionCall = async (subscription: string) => {
            try {
                const response = await fetch(`${API_URL}/requestSubscription`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ subscription }),
                    credentials: 'include',
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    errorMessage.value = errorData.message;
                    messageType.value = "error";
                    clearErrorMessages();
                } else {
                    const data = await response.json();
                    errorMessage.value = data.message;
                    messageType.value = "success";
                    clearErrorMessages();
                }
            } catch (e) {
                errorMessage.value = 'An error occurred while processing your request.';
                messageType.value = "error";
                clearErrorMessages();
            }
        };

        onMounted(() => {
            username.value = localStorage.getItem("username") || "";
            chatId.value = localStorage.getItem("chatId") || "";
            subscriptionStatus.value = localStorage.getItem("subscriptionStatus") || "";
            subscriptionStatus.value = localStorage.getItem("subscriptionEndDate") || "";
        });

        return {
            username,
            chatId,
            subscriptionStatus,
            subscriptionEndDate,
            errorMessage,
            messageType,
            requestSubscriptionCall,
            clearErrorMessages,
            popupVisible,
            selectedSubscription
        };
    },
    data() {
        return {
            subscriptions: {
                basic: {
                    title: 'BlueGemBot Basic',
                    perks: [
                        '- Track up to 25 skins.',
                        '- Filter on min and max float for each skin.',
                        '- Get instant notifications from BlueGemBot.',
                    ],
                },
                gold: {
                    title: 'BlueGemBot Gold',
                    perks: [
                        '- All Basic features.',
                        '- Track up to 50 skins.',
                        '- Priority support.',
                    ],
                },
                elite: {
                    title: 'BlueGemBot Elite',
                    perks: [
                        '- All Gold features.',
                        '- Track up to 100 skins.',
                        '- Allows Discord server integration.',
                        '- Bluegem only mode.',
                        '- Discount filter.',
                        '- Fade percentage filter.',
                        '- Personalized support.',
                    ],
                },
            } as SubscriptionsPage,
        };
    },
    computed: {
        selectedSubscriptionTitle(): string {
            return this.subscriptions[this.selectedSubscription]?.title || '';
        },
        selectedSubscriptionPerks(): string[] {
            return this.subscriptions[this.selectedSubscription]?.perks || [];
        },
    },
    methods: {
        openPopup(subscription: string): void {
            this.selectedSubscription = subscription;
            this.popupVisible = true;
        },
        closePopup(): void {
            this.popupVisible = false;
            this.selectedSubscription = '';
        }
    }
});