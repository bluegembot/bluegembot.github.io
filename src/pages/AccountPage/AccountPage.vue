<template>
  <div>

    <Navbar
        :rightItems="[
        { name: 'Dashboard', path: '/dashboard' }
      ]"
    />
    <main>
      <h1 class="main-title">Account information</h1>
      <p v-if="errorMessage"
         :class="[
     messageType === 'success' ? 'success-message' : 'error-message',
     'fixed-top-message'
   ]">
        {{ errorMessage }}
      </p>

      <!-- Section with Upcoming and Announcements -->
      <div class="upcoming-announcements">
        <div class="upcoming">
          <h2>{{ username }}'s info</h2>
          <ul class="upcoming-list">
            <li>Your BGB username: {{ username }}</li>
            <li>Your discord user ID: {{ chatId }}</li>
            <li>Your current subscription: {{ subscriptionStatus }}</li>
          </ul>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { onMounted, ref } from "vue";
import { API_URL} from '@/config/environment';

export default {
  setup() {
    const username = ref("");
    const chatId = ref("");
    const subscriptionStatus = ref("");
    const errorMessage = ref("");
    const popupVisible = ref(false);
    const selectedSubscription = ref('');

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
          clearErrorMessages()
        } else {
          const data = await response.json();
          errorMessage.value = data.message;
          clearErrorMessages();
        }
      } catch (e) {
        errorMessage.value = 'An error occurred while processing your request.';
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
      },
    };
  },
  computed: {
    selectedSubscriptionTitle() {
      return this.subscriptions[this.selectedSubscription]?.title || '';
    },
    selectedSubscriptionPerks() {
      return this.subscriptions[this.selectedSubscription]?.perks || [];
    },
  },
  methods: {
    openPopup(subscription) {
      this.selectedSubscription = subscription;
      this.popupVisible = true;
    },
    closePopup() {
      this.popupVisible = false;
      this.selectedSubscription = '';
    }
  }
};
</script>
<style>
.success-message {
  color: green;
  font-weight: bold;
}

.error-message {
  color: red;
  font-weight: bold;
}

.subscription-grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 50px auto;
  //padding: 5px;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  max-height: fit-content;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.grid-item:hover {
  transform: scale(1.03);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.subscription-image {
  width: 100px;
  height: 100px;
  margin-bottom: 15px;
  border-radius: 10px;
  object-fit: cover;
}

.subscription-info h3 {
  text-align: center;
  font-size: 22px;
  margin-bottom: 10px;
  color: #333;
}

body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.main-title {
  text-align: center;
  font-size: 36px;
  color: #333;
}

body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

main {
  padding-top: 10px; /* Adjust this value to reduce space */
}

.main-title {
  text-align: center;
  font-size: 36px;
  color: #333;
  margin-top: 10px; /* Reduced from default value */
}

/* Add styling for the popup overlay and content */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.popup-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.close-btn {
  margin-top: 10px;
  padding: 5px 10px;
  border: none;
  background-color: #333;
  color: #fff;
  border-radius: 5px;
  cursor: pointer;
}

.close-btn:hover {
  background-color: #555;
}

.fixed-top-message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  z-index: 9999; /* Ensure it's on top of other elements */
  opacity: 1;
  transition: opacity 1s ease-out;
}

</style>