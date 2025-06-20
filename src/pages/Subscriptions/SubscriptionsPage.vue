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

    <h2 class="subscription-tiers-title2">SUBSCRIPTION TIERS (click for more)</h2>

    <div class="subscription-grid-container">
      <div
          class="grid-item basicBorder"
          @click="openPopup('basic')"
      >
        <img class="subscription-image" src="@/assets/BGBLogo.jpg" alt="BGB Basic subscription logo" />
        <div class="subscription-info">
          <h3>BlueGemBot Basic</h3>
          <p>Access essential features with basic filtering to track skins efficiently.</p>
          <div class="price-tag basicText">&euro;7.49/month</div>
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
          <div class="price-tag goldText">&euro;12.49/month</div>
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
      <router-link to="/checkoutBasic">
      <div
          class="grid-item basicBorder"
      >
        <div class="subscription-info">
          <h3>Get basic</h3>
        </div>

      </div>
      </router-link>
      <router-link to="/checkoutGold">
      <div
          class="grid-item goldBorder"
      >

        <div class="subscription-info">
          <h3>Get gold</h3>
        </div>

      </div>
      </router-link>
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

<script lang="ts" src="./SubscriptionsPage.ts"></script>
<style src="./SubscriptionsPage.css"></style>