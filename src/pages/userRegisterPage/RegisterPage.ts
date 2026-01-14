import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {API_URL} from '@/config/environment';

export const useRegistrationForm = () => {
  const router = useRouter();
  const route = useRoute();

  const form = ref({
    userName: '',
    OTP: '',
  });

  const errorMessage = ref('');

  // Store aID from URL query to localStorage if valid
  const aID = route.query.aID;
  if (aID && typeof aID === 'string' && aID.length >= 17) {
    localStorage.setItem('aID', aID);
  }

  const handleSubmit = async () => {
    try {

      // Get and validate aID
      const aIDValue = localStorage.getItem('aID');
      let validatedAID: string | null = null;

      if (aIDValue && /^\d{16,25}$/.test(aIDValue)) {
        validatedAID = aIDValue;
        console.log('Valid aID found:', validatedAID);
      }

      // Build request body with proper typing
      const requestBody: {
        username: string;
        itemsOfInterest: never[];
        OTP: string;
        aID?: string;
      } = {
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
        },
        body: JSON.stringify(requestBody),
        credentials: 'include',
      });

      if (response.status === 201) {
        router.push('/dashboard');
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