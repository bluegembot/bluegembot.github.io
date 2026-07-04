import { defineComponent, onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
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
        const showCancelledMessage = ref(false);

        const route = useRoute();
        const router = useRouter();

        const clearErrorMessages = () => {
            setTimeout(() => {
                errorMessage.value = '';
            }, 2500);
        };

        const dismissCancelledMessage = () => {
            showCancelledMessage.value = false;
        };

        onMounted(() => {
            username.value = localStorage.getItem("username") || "";
            chatId.value = localStorage.getItem("chatId") || "";
            subscriptionStatus.value = localStorage.getItem("subscriptionStatus") || "";

            // Returning from a cancelled Stripe checkout: show the "order cancelled" popup
            // then strip the flag from the URL so it doesn't re-trigger on refresh.
            if (route.query.cancelled === 'true') {
                showCancelledMessage.value = true;
                const { cancelled, ...rest } = route.query;
                router.replace({ path: '/subscriptions', query: rest });
            }
        });

        return {
            username,
            chatId,
            subscriptionStatus,
            errorMessage,
            messageType,
            clearErrorMessages,
            popupVisible,
            selectedSubscription,
            showCancelledMessage,
            dismissCancelledMessage
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

      // NEW:
      selectedCheckoutRoute(): string {
        const routes: Record<string, string> = {
          basic: '/checkoutBasic',
          gold: '/checkoutGold',
          // elite: '' // no route (coming soon)
        };
        return routes[this.selectedSubscription] || '';
      },
      selectedCtaText(): string {
        const labels: Record<string, string> = {
          basic: 'Get basic',
          gold: 'Get gold',
        };
        return labels[this.selectedSubscription] || '';
      },
      selectedCtaBorderClass(): string {
        const classes: Record<string, string> = {
          basic: 'basicBorder',
          gold: 'goldBorder',
        };
        return classes[this.selectedSubscription] || '';
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