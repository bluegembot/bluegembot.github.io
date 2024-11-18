import { ref } from 'vue';

export const useRegistrationForm = () => {
    const form = ref({
        userName: '',
        OTL: '',
    });

    const errorMessage = ref('');
    const csrfToken = ref('');

    const fetchCsrfToken = async () => {
        try {
            const response = await fetch('https://bluegembot.duckdns.org/csrf-token', {
                credentials: 'include',
            });
            const data = await response.json();
            csrfToken.value = data.csrfToken;
        } catch (error) {
            console.error('Failed to fetch CSRF token:', error);
        }
    };

    const handleSubmit = async () => {
        try {
            await fetchCsrfToken();  // Ensure CSRF token is loaded

            const requestBody = {
                username: form.value.userName,
                OTL: form.value.OTL,
            };

            const response = await fetch('https://bluegembot.duckdns.org/loginUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfToken.value,  // Add CSRF token to the header
                },
                body: JSON.stringify(requestBody),
                credentials: 'include',
            });

            if (response.status === 201) {
                this.$router.push('/dashboard'); // Navigate properly using Vue Router
            } else {
                errorMessage.value = 'Registration failed. Please try again.';
            }
        } catch (error) {
            console.error(error);
            errorMessage.value = 'An error occurred while registering. Please try again.';
        }
    };

    return { form, errorMessage, handleSubmit };
};
