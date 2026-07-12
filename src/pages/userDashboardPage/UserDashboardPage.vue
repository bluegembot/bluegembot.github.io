<template>
  <div class="dashboard-page">
    <Navbar
        :leftItems="[
        { name: 'Track new skin', path: '/skinSelector' },
        { name: 'Account', path: '/account' },
        { name: 'Auto Opener', path: '/autoOpen' }
      ]"
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
            <span v-if="!isLoadingSkins" class="skin-count">({{ trackedSkins.length }})</span>
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

          <div v-if="!isLoadingSkins && trackedSkins.length > 2" class="skin-search-container">
            <input
                v-model="skinSearchQuery"
                type="text"
                class="skin-search-input"
                placeholder="Search your tracked skins..."
            />
          </div>

          <ul class="tracked-skins-unordered-list">
            <!-- Loading skeletons -->
            <template v-if="isLoadingSkins">
              <li v-for="n in 3" :key="`skeleton-${n}`" class="tracked-skin-item skeleton-item">
                <div class="skeleton-header">
                  <div class="skeleton skeleton-image"></div>
                  <div class="skeleton skeleton-title"></div>
                </div>
                <div class="skeleton skeleton-line"></div>
                <div class="skeleton skeleton-line skeleton-line-short"></div>
              </li>
            </template>

            <template v-else-if="trackedSkins.length > 0">
              <li
                  v-for="skin in filteredTrackedSkins"
                  :key="`${skin.name}-${skin.phase || ''}-${skin.minWear}-${skin.maxWear}`"
                  class="tracked-skin-item"
              >
                <div class="skin-info">
                  <div class="skin-header">
                    <img
                        :src="skin.imageUrl || skinPlaceholder"
                        @error="onImageError"
                        :alt="getDisplayName(skin)"
                        class="skin-image"
                        loading="lazy"
                    />
                    <span v-if="!isItemStattrak(skin) && !isItemSouvenir(skin)" class="skin-name">
                      {{ getDisplayName(skin) + (skin.phase ? ' ' + skin.phase : '') }}
                    </span>
                    <span v-else-if="isItemSouvenir(skin)" class="skin-name">
                      (Souvenir) {{ getDisplayName(skin) + (skin.phase ? ' ' + skin.phase : '') }}
                    </span>
                    <span v-else-if="isItemStattrak(skin)" class="skin-name">
                      (StatTrak™) {{ getDisplayName(skin) + (skin.phase ? ' ' + skin.phase : '') }}
                    </span>
                    <span
                        v-if="getWearBadge(skin.minWear, skin.maxWear)"
                        class="wear-badge"
                        :style="{
                          color: getWearBadge(skin.minWear, skin.maxWear)!.color,
                          borderColor: getWearBadge(skin.minWear, skin.maxWear)!.color
                        }"
                    >
                      {{ getWearBadge(skin.minWear, skin.maxWear)!.label }}
                    </span>
                  </div>

                  <div class="skin-details">
                    <!-- Float Range -->
                    <div class="detail-row">
                      <span class="detail-label">Float Range:</span>
                      <div class="editable-field">
                        <FloatRangeSlider
                            v-model:minValue="skin.minWear"
                            v-model:maxValue="skin.maxWear"
                            :boundMin="skin.allowedMinFloat ?? 0"
                            :boundMax="skin.allowedMaxFloat ?? 1"
                            @change="markSkinAsChanged(skin)"
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
                              :checked="minDiscountPercentage(skin) > 0"
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
                              :checked="minFadePercentage(skin) > 0"
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

              <li v-if="filteredTrackedSkins.length === 0" class="no-tracking-message">
                No tracked skins match "{{ skinSearchQuery }}".
              </li>
            </template>

            <template v-else>
              <li class="empty-state">
                <div class="empty-state-icon">🎯</div>
                <p class="empty-state-title">No tracked skins yet</p>
                <p class="empty-state-text">
                  Pick a skin to track and BGB will notify you when a matching deal shows up.
                </p>
                <router-link to="/skinSelector">
                  <button class="empty-state-button">Track your first skin</button>
                </router-link>
              </li>
            </template>
          </ul>
        </div>
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
import FloatRangeSlider from '../../components/UserDashboard/FloatRangeSlider.vue';

type DashboardSkin = {
  name: string;
  imageUrl?: string | null;
  allowedMinFloat?: number;
  allowedMaxFloat?: number;
  phase?: string | null;
  minWear: number;
  maxWear: number;
  forcedDiscount?: number | null;
  minFadePercentage?: number | null;
  itemIsStattrak?: boolean | null;
  itemIsSouvenir?: boolean | null;
};

export default defineComponent({
  name: 'UserDashboardPage',
  components: {
    SettingsModal,
    FloatRangeSlider
  },
  setup() {
    const dashboard = useUserDashboard();

    const minFadePercentage = (skin: DashboardSkin): number => {
      return skin.minFadePercentage ?? 0;
    };

    const minDiscountPercentage = (skin: DashboardSkin): number => {
      return skin.forcedDiscount ?? 0;
    };

    const isForcedDiscountEnabled = (skin: DashboardSkin): boolean => {
      return skin.forcedDiscount !== null && skin.forcedDiscount !== undefined;
    };

    const isMinFadeEnabled = (skin: DashboardSkin): boolean => {
      return skin.minFadePercentage !== null && skin.minFadePercentage !== undefined;
    };

    const isItemStattrak = (skin: DashboardSkin): boolean => {
      return skin.itemIsStattrak ?? false;
    };

    const isItemSouvenir = (skin: DashboardSkin): boolean => {
      return skin.itemIsSouvenir ?? false;
    };

    return {
      ...dashboard,
      isForcedDiscountEnabled,
      isMinFadeEnabled,
      isItemStattrak,
      isItemSouvenir,
      minDiscountPercentage,
      minFadePercentage
    };
  }
});
</script>
