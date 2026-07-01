<script setup lang="ts">
import { ref } from 'vue';

const DISMISS_KEY = 'skinportNoticeDismissed';

const isVisible = ref(sessionStorage.getItem(DISMISS_KEY) !== 'true');

function dismiss() {
  isVisible.value = false;
  sessionStorage.setItem(DISMISS_KEY, 'true');
}
</script>

<template>
  <div v-if="isVisible" class="site-notification-banner" role="alert">
    <span class="site-notification-text">
      Due to recent Skinport changes, the Skinport links are no longer functional. We are trying to resolve this as quickly as possible. <br> Unfortunately this is outside of our control. <br> Last update: 1 jul 2026.
    </span>
    <button
        class="site-notification-close"
        type="button"
        aria-label="Dismiss notification"
        @click="dismiss"
    >
      &times;
    </button>
  </div>
</template>

<style scoped>
.site-notification-banner {
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 0.75rem 2.5rem;
  background-color: #b45309;
  color: #fff;
  text-align: center;
  font-size: 0.95rem;
}

.site-notification-text {
  max-width: 60ch;
}

.site-notification-close {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none !important;
  border: none !important;
  color: #fff !important;
  font-size: 2rem !important;
  line-height: 1;
  cursor: pointer;
  padding: 0 0.5rem;
}

.site-notification-close:hover {
  opacity: 0.8;
}

@media (max-width: 600px) {
  .site-notification-banner {
    padding: 0.75rem 2.25rem;
    font-size: 0.85rem;
  }
}
</style>
