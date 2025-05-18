<template>
  <div>
    <!-- Auto-opener component -->
    <div class="auto-opener-container">
      <h2>Auto Opener</h2>
      <p class="beta-tag">OPEN BETA</p>
      <p class="auto-opener-description">
        Automatically open browser listings when they appear. This feature requires Chrome with the BlueGemBot browser extension.
      </p>

      <div class="toggle-container">
        <label class="toggle-switch">
          <input type="checkbox" v-model="autoOpenerEnabled" @change="toggleAutoOpener">
          <span class="slider round"></span>
        </label>
        <span class="toggle-label">{{ autoOpenerEnabled ? 'Enabled' : 'Disabled' }}</span>
      </div>

      <router-link to="/dashboard">
        <button class="dashboard-button">Back to Dashboard</button>
      </router-link>
    </div>
  </div>
</template>

<style src="./AutoOpenPage.css"></style>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAutoOpenPage } from './AutoOpenPage';

export default defineComponent({
  name: 'AutoOpenPage',
  setup() {
    return useAutoOpenPage();
  }
});
</script>