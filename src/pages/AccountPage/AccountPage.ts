import { onMounted, ref } from "vue";
import { API_URL } from '@/config/environment';

export const subscriptionsData = {
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
};

export default function useAccountPage() {
    const username = ref("");
    const chatId = ref("");
    const subscriptionStatus = ref("");
    const errorMessage = ref("");
    const popupVisible = ref(false);
    const selectedSubscription = ref('');
    const messageType = ref('error');

    const clearErrorMessages = () => {
        setTimeout(() => {
            errorMessage.value = '';
        }, 2500);
    };

    const requestSubscriptionCall = async (subscription) => {
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
                messageType.value = 'error';
                clearErrorMessages();
            } else {
                const data = await response.json();
                errorMessage.value = data.message;
                messageType.value = 'success';
                clearErrorMessages();
            }
        } catch (e) {
            errorMessage.value = 'An error occurred while processing your request.';
            messageType.value = 'error';
            clearErrorMessages();
        }
    };

    onMounted(() => {
        username.value = localStorage.getItem("username");
        chatId.value = localStorage.getItem("chatId");
        subscriptionStatus.value = localStorage.getItem("subscriptionStatus");
    });

    return {
        username,
        chatId,
        subscriptionStatus,
        errorMessage,
        messageType,
        requestSubscriptionCall,
        clearErrorMessages,
        popupVisible,
        selectedSubscription
    };
}