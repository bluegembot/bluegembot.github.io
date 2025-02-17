<template>

  <p v-if="errorMessage"
     :class="[
     messageType === 'success' ? 'success-message' : 'error-message',
     'fixed-top-message'
   ]">
    {{ errorMessage }}
  </p>

<main>
  <Navbar
      :rightItems="[
        { name: 'Dashboard', path: '/dashboard' }
      ]"
  />

  <h2 class="subscription-tiers-title2">SUBSCRIPTION TIERS</h2>

  <div class="subscription-grid-container">
    <div
        class="grid-item basicBorder"
        @click="openPopup('basic')"
    >
      <img class="subscription-image" src="@/assets/BGBLogo.jpg" alt="BGB Basic subscription logo" />
      <div class="subscription-info">
        <h3>BlueGemBot Basic</h3>
        <p>Access essential features with basic filtering to track skins efficiently.</p>
        <div class="price-tag basicText">&euro;10/month</div>
      </div>
    </div>
    <div
        class="grid-item goldBorder"
        @click="openPopup('gold')"
    >
      <img class="subscription-image" src="@/assets/BGBGold.jpg" alt="BGB Gold subscription logo" />
      <div class="subscription-info">
        <h3>BlueGemBot Gold</h3>
        <p>Access everything from BlueGemBot Basic. Enjoy less restrictive skin tracking capabilities.</p>
        <div class="price-tag goldText">&euro;15/month</div>
      </div>
    </div>
    <div
        class="grid-item eliteBorder"
        @click="openPopup('elite')"
    >
      <img class="subscription-image" src="@/assets/BGBElite.jpg" alt="BGB Elite subscription logo" />
      <div class="subscription-info">
        <h3>BlueGemBot Elite</h3>
        <p>Everything from Gold, premium filtering capabilities and Discord server integration.</p>
        <div class="price-tag eliteText"><strong>COMING SOON</strong></div>
      </div>
    </div>
    <div
        class="grid-item basicBorder"
        @click="requestSubscriptionCall('Basic')"
    >
      <div class="subscription-info">
        <h3>Request basic</h3>
      </div>
    </div>
    <div
        class="grid-item goldBorder"
        @click="requestSubscriptionCall('Gold')"
    >
      <div class="subscription-info">
        <h3>Request gold</h3>
      </div>
    </div>
  </div>

  <!-- Popup for In-depth Information -->
  <div v-if="popupVisible" class="popup-overlay" @click.self="closePopup">
    <div class="popup-content">
      <h2>{{ selectedSubscriptionTitle }}</h2>
      <ul class="subscription-perks">
        <li v-for="perk in selectedSubscriptionPerks" :key="perk">{{ perk }}</li>
      </ul>
      <button class="close-btn" @click="closePopup">Close</button>
    </div>
  </div>
</main>
</template>

<script>
import { onMounted, ref } from "vue";
import {API_URL} from '@/config/environment';

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

<style scoped>
.subscription-tiers-title2 {
  text-align: center;
  font-size: 28px;
  color: #444;
  margin: 30px 0 20px;
  text-transform: uppercase;
  font-weight: bold;
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

.success-message {
  color: green;
  font-weight: bold;
}

.error-message {
  color: red;
  font-weight: bold;
}

.coming-soon {
  color: #dd2524;
  font-size: 18px;
  margin-top: 10px;
  font-weight: bold;
}

.price-tag {
  font-size: 20px;
  font-weight: bold;
  color: #2ed1e1;
  margin-top: 10px;
  text-align: center;
}

.basicText {
  color: #2ed1e1;
}

.basicBorder {
  border: 2px solid #2ed1e1;
  box-shadow: 0 0 15px #2ed1e1;

}

.goldText {
  color: #e1be18;
}

.goldBorder {
  border: 2px solid #e1be18;
  box-shadow: 0 0 15px #e1be18;
}

.eliteText {
  color: #dd2524
}

.eliteBorder {
  border: 2px solid #dd2524;
  box-shadow: 0 0 15px #dd2524;
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
  max-height: 500px;
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


</style>