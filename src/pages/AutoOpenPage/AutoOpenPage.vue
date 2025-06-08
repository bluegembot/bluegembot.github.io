<template>
  <Navbar
      :rightItems="[
        { name: 'Dashboard', path: '/dashboard' }
      ]"
  />
  <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  <div class="auto-opener-page">
    <h1>Auto Opener</h1>
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
    <!-- Permission Notice - Only show when permissions are denied -->
    <div v-if="hasPopupPermission === false" class="permission-notice">
      <div class="notice-icon">⚠️</div>
      <div class="notice-content">
        <h3>Browser Permission Required</h3>
        <p>
          To use the auto-opener feature, you need to allow this site to redirect you to different sites in new tabs.
          Please check your browser settings and enable pop-ups and redirects for this domain.
        </p>
        <details class="browser-instructions">
          <summary>How to enable permissions</summary>
          <div class="instructions-content">
            <div class="browser-links">
              <a href="https://support.google.com/chrome/answer/95472" target="_blank" rel="noopener noreferrer">
                <strong>Google Chrome</strong> - Enable pop-ups and redirects
              </a>

              <a href="https://support.microsoft.com/en-us/microsoft-edge/block-pop-ups-in-microsoft-edge-1d8ba4f8-f385-9a0b-e944-aa47339b6bb5" target="_blank" rel="noopener noreferrer">
                <strong>Microsoft Edge</strong> - Manage pop-up blocker
              </a>

              <a href="https://support.mozilla.org/en-US/kb/pop-blocker-settings-exceptions-troubleshooting" target="_blank" rel="noopener noreferrer">
                <strong>Mozilla Firefox</strong> - Pop-up blocker settings
              </a>

              <a href="https://support.apple.com/guide/safari/block-or-allow-pop-up-windows-sfri40696/mac" target="_blank" rel="noopener noreferrer">
                <strong>Safari (Mac)</strong> - Block or allow pop-up windows
              </a>

              <a href="https://support.apple.com/guide/iphone/block-pop-ups-iph364703c2d/ios" target="_blank" rel="noopener noreferrer">
                <strong>Safari (iOS)</strong> - Block pop-ups on iPhone/iPad
              </a>

              <a href="https://help.opera.com/en/latest/web-preferences/#popups" target="_blank" rel="noopener noreferrer">
                <strong>Opera</strong> - Pop-up and ad blocking settings
              </a>

              <a href="https://vivaldi.com/blog/pop-ups-and-ads/" target="_blank" rel="noopener noreferrer">
                <strong>Vivaldi</strong> - Managing pop-ups and ads
              </a>

              <a href="https://help.duckduckgo.com/duckduckgo-help-pages/desktop/adding-duckduckgo/" target="_blank" rel="noopener noreferrer">
                <strong>DuckDuckGo Browser</strong> - Privacy and blocking settings
              </a>

              <a href="https://support.brave.com/hc/en-us/articles/360022806212-How-do-I-use-Shields-while-browsing" target="_blank" rel="noopener noreferrer">
                <strong>Brave Browser</strong> - Shield settings and exceptions
              </a>
            </div>
          </div>
        </details>
        <button @click="reloadPage" class="recheck-btn">
          Check Again
        </button>
      </div>
    </div>


  </div>
</template>

<script lang="ts" src="./AutoOpenPage.ts"></script>

<style src="./AutoOpenPage.css"></style>