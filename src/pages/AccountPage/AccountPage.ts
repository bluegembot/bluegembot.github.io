import { defineComponent, onMounted, ref, computed } from "vue";

export default defineComponent({
    setup() {
        const username = ref("");
        const chatId = ref("");
        const subscriptionStatus = ref("");
        const subscriptionEndDate = ref("");
        const errorMessage = ref("");
        const popupVisible = ref(false);
        const messageType = ref("");

        const clearErrorMessages = () => {
            setTimeout(() => {
                errorMessage.value = '';
            }, 2500);
        };

        const formatDate = (dateString : string) => {
            if (!dateString || dateString === "Indefinite") return dateString;

            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        };

        // Or use a computed property
        const formattedEndDate = computed(() => {
            return formatDate(subscriptionEndDate.value);
        });

        onMounted(() => {
            username.value = localStorage.getItem("username") || "";
            chatId.value = localStorage.getItem("chatId") || "";
            subscriptionStatus.value = localStorage.getItem("subscriptionStatus") || "";
            subscriptionEndDate.value = localStorage.getItem("subscriptionEndDate") || "";
        });

        return {
            username,
            chatId,
            subscriptionStatus,
            subscriptionEndDate,
            formattedEndDate, // If using computed
            formatDate, // If using method
            errorMessage,
            messageType,
            clearErrorMessages,
            popupVisible,
        };
    },
});