import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {API_URL} from '@/config/environment';

export const useRegistrationForm = () => {
  const router = useRouter(); // Use the Composition API's useRouter hook
  const route = useRoute();   // Use the Composition API's useRoute hook

  const form = ref({
    userName: '',
    OTP: '',
  });

  const errorMessage = ref('');
  const csrfToken = ref('');

  // Store aID from URL query to localStorage if valid
  if(route.query.aID && route.query.aID.length >= 17){
    const aID = route.query.aID;
    localStorage.setItem('aID', aID);
  }

  const fetchCsrfToken = async () => {
    try {
      const response = await fetch(`${API_URL}/csrf-token`, {
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

      // Get and validate aID - declare outside the if block
      const aIDValue = localStorage.getItem('aID');
      let validatedAID = null;

      if (aIDValue && /^\d{16,25}$/.test(aIDValue)) {
        validatedAID = aIDValue;
        console.log('Valid aID found:', validatedAID);
      }

      // Build request body
      const requestBody = {
        username: form.value.userName,
        itemsOfInterest: [],
        OTP: form.value.OTP,
      };

      // Add aID to request body only if it's valid
      if (validatedAID) {
        requestBody.aID = validatedAID;
      }

      const response = await fetch(`${API_URL}/addUser`, {
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