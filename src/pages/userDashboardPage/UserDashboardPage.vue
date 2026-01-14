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
      <p
          v-if="errorMessage"
          :class="[
          messageType === 'success' ? 'success-message' : 'error-message',
          'fixed-top-message'
        ]"
      >
        {{ errorMessage }}
      </p>

      <!-- Subscription Required Error Message -->
      <div v-if="showSubscriptionError" class="subscription-error-message fixed-top-message">
        <div class="subscription-error-content">
          <div class="error-icon">🔒</div>
          <div class="error-text">
            <p><strong>Subscription Required</strong></p>
            <p>Subscribe to access csfloat tracking!</p>
          </div>
          <router-link to="subscriptions">
            <button class="upgrade-button">
              Upgrade Now
            </button>
          </router-link>
        </div>
      </div>

      <!-- Section with Upcoming and Announcements -->
      <div class="tracked-skins-section">
        <!-- Upcoming list -->
        <div class="tracked-skins-container">
          <h2>
            Tracked skins
            <button
                @click="openSettingsModal"
                class="settings-btn"
                title="Settings"
            >
              <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="3"></circle>
                <path
                    d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
                ></path>
              </svg>
            </button>
          </h2>

          <ul class="tracked-skins-unordered-list">
            <template v-if="trackedSkins.length > 0">
              <li v-for="(skin, index) in trackedSkins" :key="skin.name" class="tracked-skin-item">
                <div class="skin-info">
                  <div class="skin-header">
                    <span class="skin-index">{{ index + 1 }}.</span>
                    <span class="skin-name">{{ skin.name }}</span>
                  </div>

                  <div class="skin-details">
                    <!-- Float Range -->
                    <div class="detail-row">
                      <span class="detail-label">Float Range:</span>
                      <div class="editable-field">
                        <input
                            type="number"
                            v-model.number="skin.minWear"
                            @input="markSkinAsChanged(skin)"
                            class="float-input"
                            min="0"
                            max="1"
                            step="0.001"
                            placeholder="0.000"
                        /> -
                        <input
                            type="number"
                            v-model.number="skin.maxWear"
                            @input="markSkinAsChanged(skin)"
                            class="float-input"
                            min="0"
                            max="1"
                            step="0.001"
                            placeholder="1.000"
                        />
                      </div>
                    </div>

                    <!-- Forced Discount -->
                    <div class="detail-row">
                      <span class="detail-label">Forced Discount:</span>
                      <div class="editable-field">
                        <label class="checkbox-container">
                          <input
                              type="checkbox"
                              :checked="isForcedDiscountEnabled(skin)"
                              @change="toggleForcedDiscount(skin)"
                          />
                          <span class="checkmark"></span>
                        </label>

                        <input
                            v-if="isForcedDiscountEnabled(skin)"
                            type="number"
                            v-model.number="skin.forcedDiscount"
                            @input="markSkinAsChanged(skin)"
                            class="percentage-input"
                            min="0"
                            max="100"
                            step="1"
                            placeholder="0"
                        />
                        <span v-if="isForcedDiscountEnabled(skin)" class="percentage-symbol">%</span>
                        <span v-else class="disabled-text">Disabled</span>
                      </div>
                    </div>

                    <!-- Min Fade % -->
                    <div class="detail-row">
                      <span class="detail-label">Min Fade %:</span>
                      <div class="editable-field">
                        <label class="checkbox-container">
                          <input
                              type="checkbox"
                              :checked="isMinFadeEnabled(skin)"
                              @change="toggleMinFade(skin)"
                          />
                          <span class="checkmark"></span>
                        </label>

                        <input
                            v-if="isMinFadeEnabled(skin)"
                            type="number"
                            v-model.number="skin.minFadePercentage"
                            @input="markSkinAsChanged(skin)"
                            class="percentage-input"
                            min="0"
                            max="100"
                            step="1"
                            placeholder="0"
                        />
                        <span v-if="isMinFadeEnabled(skin)" class="percentage-symbol">%</span>
                        <span v-else class="disabled-text">Disabled</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="button-container">
                  <div v-if="hasUnsavedChanges(skin)" class="changes-buttons">
                    <button
                        @click="cancelChanges(skin)"
                        class="cancel-changes-button"
                        :disabled="isUpdating"
                    >
                      Cancel Changes
                    </button>
                    <button
                        @click="submitChanges(skin)"
                        class="submit-changes-button"
                        :disabled="isUpdating"
                    >
                      {{ isUpdating ? 'Saving...' : 'Submit Changes' }}
                    </button>
                  </div>

                  <button class="stop-tracking-button" @click="stopTracking(skin)">
                    Stop Tracking
                  </button>
                </div>
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

    <!-- Settings Modal -->
    <SettingsModal
        :visible="isSettingsModalOpen"
        title="User Settings"
        description="Configure your tracking preferences:"
        :settings="userSettings"
        :isLoading="isSettingsLoading"
        @close="closeSettingsModal"
        @save="handleSettingsSave"
    />
  </div>
</template>

<style src="./UserDashboardPage.css"></style>

<script lang="ts">
import { defineComponent } from 'vue';
import { useUserDashboard } from './UserDashboardPage';
import SettingsModal from '../../components/UserDashboard/SettingsModal.vue';

export default defineComponent({
  name: 'UserDashboardPage',
  components: {
    SettingsModal
  },
  setup() {
    const dashboard = useUserDashboard();

    const isForcedDiscountEnabled = (skin: unknown): boolean => {
      const s = skin as { forcedDiscount?: unknown };
      return s.forcedDiscount !== false && s.forcedDiscount !== null && s.forcedDiscount !== undefined;
    };

    const isMinFadeEnabled = (skin: unknown): boolean => {
      const s = skin as { minFadePercentage?: unknown };
      return s.minFadePercentage !== false && s.minFadePercentage !== null && s.minFadePercentage !== undefined;
    };

    return {
      ...dashboard,
      isForcedDiscountEnabled,
      isMinFadeEnabled
    };
  }
});
</script>
