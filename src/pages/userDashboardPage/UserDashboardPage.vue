<template>
  <div>
    <Navbar
        :rightItems="[
        { name: 'Upgrade', path: '/subscriptions' }
      ]"
    />
    <main>
      <h1 class="main-title">Welcome to BGB, {{ username }}!</h1>

      <!-- Error/Success Message -->
      <p v-if="errorMessage"
         :class="[
     messageType === 'success' ? 'success-message' : 'error-message',
     'fixed-top-message'
   ]">
        {{ errorMessage }}
      </p>
      <!-- Section with Upcoming and Announcements -->
      <div class="tracked-skins-section">
        <!-- Upcoming list -->
        <div class="tracked-skins-container">
          <h2>Tracked skins</h2>
          <ul class="tracked-skins-unordered-list">
            <template v-if="trackedSkins.length > 0">
              <li v-for="(skin, index) in trackedSkins" :key="skin.name" class="tracked-skin-item">
                <div class="skin-info">
                  <div class="skin-header">
                    <span class="skin-index">{{ index + 1 }}.</span>
                    <span class="skin-name">{{ skin.name }}</span>
                  </div>
                  <div class="skin-details">
                    <div class="detail-row">
                      <span class="detail-label">Float Range:</span>
                      <span class="detail-value">{{ skin.minWear }} - {{ skin.maxWear }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Forced Discount:</span>
                      <span v-if="skin.forcedDiscount" class="detail-value">{{ skin.forcedDiscount }}%</span>
                      <span v-else class="detail-value">Disabled</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Min Fade %:</span>
                      <span v-if="skin.minFadePercentage" class="detail-value">{{ skin.minFadePercentage }}%</span>
                      <span v-else class="detail-value">Disabled</span>
                    </div>
                  </div>
                </div>
                <button class="stop-tracking-button" @click="stopTracking(skin)">
                  Stop Tracking
                </button>
              </li>
            </template>
            <template v-else>
              <li class="no-tracking-message">
                Not tracking any skins at this time, add a skin to start tracking.
              </li>
            </template>
          </ul>
        </div>
      </div>

      <!-- Grid section -->
      <div class="grid-container-dashboard">

        <router-link to="/skinSelector" class="grid-item">Track new skin</router-link>

        <router-link to="/account" class="grid-item">Account</router-link>

        <router-link to="/autoOpen" class="grid-item">Auto Opener</router-link>
      </div>
    </main>
  </div>
</template>

<style src="./UserDashboardPage.css"></style>

<script lang="ts">
import { defineComponent } from 'vue';
import { useUserDashboard } from './UserDashboardPage';

export default defineComponent({
  name: 'UserDashboardPage',
  setup() {
    return useUserDashboard();
  }
});
</script>