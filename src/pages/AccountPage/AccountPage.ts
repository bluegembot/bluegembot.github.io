import { defineComponent, onMounted, ref } from "vue";

export default defineComponent({
    setup() {
        const username = ref("");
        const chatId = ref("");
        const subscriptionStatus = ref("");
        const errorMessage = ref("");
        const popupVisible = ref(false);
        const messageType = ref(""); // Added missing messageType ref

        const clearErrorMessages = () => {
            setTimeout(() => {
                errorMessage.value = '';
            }, 2500);
        };

        onMounted(() => {
            username.value = localStorage.getItem("username") || "";
            chatId.value = localStorage.getItem("chatId") || "";
            subscriptionStatus.value = localStorage.getItem("subscriptionStatus") || "";
        });

        return {
            username,
            chatId,
            subscriptionStatus,
            errorMessage,
            messageType,
            clearErrorMessages,
            popupVisible,
        };
    },
});