<template>
  <div>
    <Navbar
        :rightItems="[
        { name: 'Dashboard', path: '/dashboard' }
      ]"
    />
    <div class="account-container">
      <h1 class="page-title">Your Account</h1>

      <div v-if="showBrowserWarning" class="browser-warning">
        <p>For the best experience, we recommend using Chrome with the BlueGemBot extension.</p>
      </div>

      <div class="account-info">
        <h2>Account Details</h2>
        <div class="info-row">
          <p><strong>Username:</strong> {{ userInfo.username }}</p>
        </div>
        <div class="info-row">
          <p><strong>Email:</strong> {{ userInfo.email }}</p>
        </div>
        <div class="info-row">
          <p><strong>Subscription:</strong> {{ userInfo.subscription || 'Free' }}</p>
        </div>
      </div>

      <div class="subscription-section">
        <h2>Upgrade Your Experience</h2>
        <div class="subscription-cards">
          <div v-for="subscription in subscriptions" :key="subscription.id" class="subscription-card">
            <div class="subscription-header">
              <h3>{{ subscription.name }}</h3>
              <p class="subscription-price">${{ subscription.price }}/month</p>
            </div>
            <p class="subscription-description">{{ subscription.description }}</p>
            <ul class="feature-list">
              <li v-for="(feature, index) in subscription.features" :key="index">{{ feature }}</li>
            </ul>
            <button @click="handleSubscribe(subscription)" class="subscribe-button">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style src="./AccountPage.css"></style>

<script lang="ts">
import { defineComponent } from 'vue';
import Navbar from '../../components/Navbar.vue';
// Import without the .ts extension and as a default import
import useAccountPage, { subscriptionsData } from './AccountPage';

export default defineComponent({
  name: 'AccountPage',
  components: {
    Navbar
  },
  setup() {
    return useAccountPage();
  }
});
</script>