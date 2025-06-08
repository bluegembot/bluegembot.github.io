<template xmlns="http://www.w3.org/1999/html">
  <!-- Modal Permission Notice - Overlay that centers on screen -->
  <div v-if="visible" class="permission-modal-overlay">
    <div class="permission-modal">
      <div class="notice-content">
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
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
        <button @click="handleRecheck" class="recheck-btn">
          {{ recheckButtonText }}
        </button>
        <router-link to="/dashboard"><button class="recheck-btn">Back to dashboard </button></router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PermissionNotice',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '⚠️Browser permission required⚠️'
    },
    message: {
      type: String,
      default: 'To use the auto-opener feature, you need to allow this site to redirect you to different sites in new tabs. Please check your browser settings and enable pop-ups and redirects for this domain. \n \n \n Please notice that the brave browser has built in blockers that cause the auto opener to not work regardless, use an alternative browser if you want to use the auto opener.'
    },
    recheckButtonText: {
      type: String,
      default: 'I enabled pop-ups and redirects'
    }
  },
  emits: ['recheck', 'close'],
  methods: {
    handleRecheck() {
      this.$emit('recheck');
    },
    handleClose() {
      this.$emit('close');
    }
  }
}
</script>

<style scoped>
/* Modal overlay - covers entire screen */
.permission-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

/* The modal content */
.permission-modal {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 12px;
  padding: 2rem;
  margin: 1rem;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  position: relative;
  animation: modalSlideIn 0.3s ease-out;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

/* Animation for modal appearance */
@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Modal-specific styling */
.notice-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.notice-content {
  flex: 1;
}

.notice-content h3 {
  color: #856404;
  margin: 0 0 1rem 0;
  text-align: center;
  font-size: 1.5rem;
}

.notice-content p {
  color: #856404;
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
  text-align: center;
  white-space: pre-wrap;
}

/* Browser instructions */
.browser-instructions {
  margin: 1.5rem 0;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  overflow: hidden;
}

.browser-instructions summary {
  padding: 1rem;
  background-color: #fffbf0;
  cursor: pointer;
  font-weight: 600;
  color: #856404;
  border-bottom: 1px solid #ffeaa7;
  user-select: none;
}

.browser-instructions summary:hover {
  background-color: #fff3cd;
}

.instructions-content {
  padding: 1rem;
  margin-top: 0;
  padding-left: 1rem;
}

.browser-links {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.browser-links a {
  display: block;
  padding: 0.75rem 1rem;
  background-color: #fffbf0;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  color: #856404;
  text-decoration: none;
  transition: all 0.2s ease;
}

.browser-links a:hover {
  background-color: #fff3cd;
  border-color: #ffd700;
  transform: translateY(-1px);
}

.browser-links strong {
  color: #6c5300;
}

/* Button styling */
.recheck-btn {
  display: block;
  width: 100%;
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #856404;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.recheck-btn:hover {
  background-color: #6c5300;
}

.recheck-btn:active {
  transform: translateY(1px);
}

/* Responsive design for mobile */
@media (max-width: 768px) {
  .permission-modal {
    margin: 0.5rem;
    padding: 1.5rem;
    max-width: calc(100% - 1rem);
    flex-direction: column;
    text-align: center;
  }

  .notice-icon {
    font-size: 2.5rem;
    align-self: center;
  }

  .notice-content h3 {
    font-size: 1.25rem;
  }
}
</style>