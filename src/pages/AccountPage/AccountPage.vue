<template>
  <div>
    <main>
      <h1 class="main-title">Account information</h1>
      <div class="logo-container">
        <div class="logo-circle">
          <img src="@/assets/BGBLogo.jpg" alt="BGB Logo" class="logo-img" />
        </div>
      </div>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <!-- Section with Upcoming and Announcements -->
      <div class="upcoming-announcements">
        <div class="upcoming">
          <h2>{{ username }}'s info</h2>
          <ul class="upcoming-list">
            <li>Your BGB username: {{ username }}</li>
            <li>Your discord chat ID: {{ chatId }}</li>
            <li>Your current subscription: {{ subscriptionStatus }}</li>
          </ul>
        </div>
      </div>

      <!-- Subscription Tiers Title -->
      <h2 class="subscription-tiers-title">SUBSCRIPTION TIERS</h2>

      <!-- Subscription Grid -->
      <div class="subscription-grid-container">
        <div class="grid-item" style="border: 2px solid #2ed1e1;box-shadow: 0 0 15px #2ed1e1;">
          <img class="subscription-image" src="@/assets/BGBLogo.jpg" alt="BGB Basic subscription logo" />
          <div class="subscription-info">
            <h3>BlueGemBot Basic</h3>
            <p>Access essential features with basic filtering to track skins efficiently.</p>
            <p><strong>Tracking Limit:</strong> 25</p>
          </div>
        </div>
        <div class="grid-item" style="border: 2px solid #e1be18; box-shadow: 0 0 15px #e1be18;">
          <img class="subscription-image" src="@/assets/BGBGold.jpg" alt="BGB Gold subscription logo" />
          <div class="subscription-info">
            <h3>BlueGemBot Gold</h3>
            <p>Access everything from BlueGemBot Basic. Enjoy less restrictive skin tracking capabilities and priority support.</p>
            <p><strong>Tracking Limit:</strong> 50</p>
          </div>
        </div>
        <div class="grid-item" style="border: 2px solid #dd2524; box-shadow: 0 0 15px #dd2524;">
          <img class="subscription-image" src="@/assets/BGBElite.jpg" alt="BGB Elite subscription logo" />
          <div class="subscription-info">
            <h3>BlueGemBot Elite</h3>
            <p>Unlock premium filtering capabilities, Discord server integration, and personalized support.</p>
            <p class="coming-soon"><strong>COMING SOON</strong></p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { onMounted, ref } from "vue";

export default {
  setup() {
    const username = ref("");
    const chatId = ref("");
    const subscriptionStatus = ref("");

    onMounted(() => {
      username.value = localStorage.getItem("username");
      chatId.value = localStorage.getItem("chatId");
      subscriptionStatus.value = localStorage.getItem("subscriptionStatus");
    });

    return {
      username,
      chatId,
      subscriptionStatus,
    };
  },
};
</script>

<style>
.error-message {
  display: flex;
  color: red;
  font-weight: bold;
  margin: 10px 0;
}

.subscription-grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 50px auto;
  padding: 20px;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.grid-item:hover {
  transform: scale(1.03);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.subscription-image {
  width: 100px;
  height: 100px;
  margin-bottom: 15px;
  border-radius: 10px;
  object-fit: cover;
}

.subscription-info h3 {
  font-size: 22px;
  margin-bottom: 10px;
  color: #333;
}

.subscription-info p {
  font-size: 16px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 10px;
}

.subscription-info p.strong {
  font-weight: bold;
}

.coming-soon {
  color: #dd2524;
  font-size: 18px;
  margin-top: 10px;
  font-weight: bold;
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

.logo-container {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.logo-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.subscription-tiers-title {
  text-align: center;
  font-size: 28px;
  color: #444;
  margin: 30px 0 20px;
  text-transform: uppercase;
  font-weight: bold;
  border-bottom: 2px solid #2ed1e1;
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


</style>
