import { onMounted, ref } from "vue";
import type { Ref } from "vue";
import { API_URL } from '@/config/environment';

interface Subscription {
    id: string;
    name: string;
    description: string;
    price: number;
    features: string[];
}

// Export subscriptions data as a separate named export
export const subscriptionsData: Subscription[] = [
    {
        id: "gold",
        name: "Gold",
        description: "Unlock advanced features",
        price: 10,
        features: [
            "Forced discount",
            "Auto opener",
            "Priority notifications",
            "Add up to 20 skins",
            "Market history tracking"
        ]
    },
    {
        id: "elite",
        name: "Elite",
        description: "Ultimate skin sniping experience",
        price: 20,
        features: [
            "Everything in Gold",
            "Up to 50 tracked skins",
            "Advanced pattern filters",
            "Investment tracking",
            "Market analytics"
        ]
    }
];

// Make this the default export
export default function useAccountPage() {
    const showBrowserWarning: Ref<boolean> = ref(false);
    const userInfo: Ref<{
        username: string;
        email: string;
        subscription: string;
    }> = ref({
        username: "",
        email: "",
        subscription: ""
    });

    const subscriptions: Ref<Subscription[]> = ref(subscriptionsData);

    // Add explicit parameter typing
    const handleSubscribe = (subscription: Subscription): void => {
        // Subscription logic here
        console.log(`Subscribing to ${subscription.name}`);
    };

    onMounted(() => {
        // Check browser compatibility
        const isChrome = navigator.userAgent.indexOf("Chrome") > -1;
        showBrowserWarning.value = !isChrome;

        // Safe way to get items from localStorage with fallbacks
        const storedUsername = localStorage.getItem('username');
        const storedEmail = localStorage.getItem('email');
        const storedSubscription = localStorage.getItem('subscription');

        // Set values with null checks
        userInfo.value.username = storedUsername || "";
        userInfo.value.email = storedEmail || "";
        userInfo.value.subscription = storedSubscription || "";
    });

    return {
        showBrowserWarning,
        userInfo,
        subscriptions,
        handleSubscribe
    };
}