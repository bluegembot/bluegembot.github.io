import { ref } from 'vue';
import { useRouter } from 'vue-router';

export const useRegistrationForm = () => {
  const router = useRouter(); // Use the Composition API's useRouter hook
  const form = ref({
    userName: '',
    OTP: '',
  });

  const errorMessage = ref('');
  const csrfToken = ref('');

  const fetchCsrfToken = async () => {
    try {
      const response = await fetch('http://localhost:3002/csrf-token', {
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
        itemsOfInterest: [],
        OTP: form.value.OTP,
      };

      const response = await fetch('https://localhost:3002/addUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': csrfToken.value,  // Add CSRF token to the header
        },
        body: JSON.stringify(requestBody),
        credentials: 'include',
      });

      if (response.status === 201) {
        router.push('/dashboard'); // Navigate using the Composition API's router
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
