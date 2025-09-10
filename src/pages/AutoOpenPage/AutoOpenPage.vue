<template>
  <Navbar
      :rightItems="[
        { name: 'Dashboard', path: '/dashboard' }
      ]"
  />
  <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  <div class="auto-opener-page">
    <h1>Auto Opener Dashboard</h1>

    <!-- Auto Opener Toggle -->
    <div class="auto-opener-controls">
      <label class="switch" :class="{ 'disabled': hasPopupPermission === false }">
        <input type="checkbox" :checked="isAutoOpenerActive" @change="toggleAutoOpener" :disabled="hasPopupPermission === false" />
        <span class="slider"></span>
      </label>
      <p>
        The auto-opener is <strong>{{ isAutoOpenerActive ? "Active" : "Inactive" }}</strong>.
      </p>

      <!-- Optional: Show permission status when granted -->
      <p v-if="hasPopupPermission === true" class="permission-status">
        ✅ Browser permissions are enabled
      </p>
    </div>

    <!-- Console Section -->
    <div class="console-section">
      <div class="console-header">
        <div class="console-title">
          <span class="console-icon">📟</span>
          <span>Console Output (system logs)</span>
        </div>
        <div class="console-controls">
          <button @click="clearConsole" class="console-btn clear-btn">Clear</button>
          <button @click="toggleConsole" class="console-btn toggle-btn">
            {{ showConsole ? 'Hide' : 'Show' }}
          </button>
        </div>
      </div>

      <div v-if="showConsole" class="console-container">
        <div class="console-logs">
          <div v-if="consoleLogs.length === 0" class="console-empty">
            Waiting for console output...
          </div>
          <div v-for="log in consoleLogs" :key="log.id" class="console-line" :class="`log-${log.type}`">
            <span class="log-timestamp">{{ log.timestamp }}</span>
            <span class="log-type">{{ log.type.toUpperCase() }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- Notification Settings Component -->
    <NotificationSettings
        ref="notificationSettingsRef"
        @log-message="addConsoleLog"
    />
  </div>

  <!-- Permission Notice Component -->
  <PermissionNotice
      :visible="hasPopupPermission === false"
      @recheck="reloadPage"
  />
</template>

<script lang="ts" src="./AutoOpenPage.ts"></script>
<style src="./AutoOpenPage.css"></style>
