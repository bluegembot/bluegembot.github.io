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
      <div class="user-information-section">
        <div class="user-information-container">
          <h2>{{ username }}'s info</h2>
          <ul class="user-information-unordered-list">
            <li>Your BGB username: {{ username }}</li>
            <li>Your discord user ID: {{ chatId }}</li>
            <li>Your current subscription: {{ subscriptionStatus }}</li>
          </ul>
        </div>
      </div>

      <!-- Subscription selection popup -->
      <div v-if="popupVisible" class="subscription-popup">
        <div class="subscription-options">
          <div
              v-for="(sub, key) in subscriptions"
              :key="key"
              class="subscription-card"
              :class="{ selected: selectedSubscription === key }"
              @click="selectedSubscription = key"
          >
            <h3>{{ sub.title }}</h3>
            <ul>
              <li v-for="(perk, index) in sub.perks" :key="index">{{ perk }}</li>
            </ul>
          </div>
        </div>
        <div class="popup-actions">
          <button @click="popupVisible = false">Cancel</button>
          <button
              @click="requestSubscriptionCall(selectedSubscription); popupVisible = false"
              :disabled="!selectedSubscription"
          >
            Request Subscription
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import Navbar from '../../components/Navbar.vue';
import useAccountPage, {subscriptionsData} from './AccountPage.ts';

export default {
  components: {
    Navbar
  },
  setup() {
    const accountPageData = useAccountPage();

    return {
      ...accountPageData,
      subscriptions: subscriptionsData
    };
  }
};
</script>

<style src="./AccountPage.css"></style>