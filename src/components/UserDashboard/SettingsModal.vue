<template>
  <div v-if="visible" class="modal-overlay" @click="handleClose">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button @click="handleClose" class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <p>{{ description }}</p>
        <div class="settings-container">
          <div class="setting-item">
            <label class="checkbox-container">

              <input
                  type="checkbox"
                  v-model="localSettings.csfloatTracking"
                  class="setting-checkbox"
              >
              <span class="checkmark"></span>
              <span class="setting-label">Enable csfloat tracking</span>
            </label>
          </div>
          <div class="setting-item">
            <label class="checkbox-container">
              <input
                  type="checkbox"
                  v-model="localSettings.skinportTracking"
                  class="setting-checkbox"
              >
              <span class="checkmark"></span>
              <span class="setting-label">Enable Skinport tracking</span>
            </label>
          </div>
          <div class="setting-item">
            <label class="checkbox-container"></label>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button @click="handleClose" class="cancel-btn">Cancel</button>
        <button
            @click="handleSave"
            class="save-btn"
            :disabled="isLoading"
        >
          {{ isLoading ? 'Saving...' : 'Save Settings' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SettingsModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Settings'
    },
    description: {
      type: String,
      default: 'Configure your tracking preferences:'
    },
    settings: {
      type: Object,
      default: () => ({
        csfloatTracking: false,
        skinportTracking: true,
      })
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'save'],
  data() {
    return {
      localSettings: { ...this.settings }
    }
  },
  watch: {
    settings: {
      handler(newSettings) {
        this.localSettings = { ...newSettings };
      },
      deep: true
    },
    visible(newVisible) {
      if (newVisible) {
        this.localSettings = { ...this.settings };
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit('close');
    },
    handleSave() {
      this.$emit('save', this.localSettings);
    }
  }
}
</script>

<style scoped>
/* Modal styles - similar to ImportSkinsModal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--color-background-mute);
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border: 3px solid var(--accent-color);
  animation: modalSlideIn 0.3s ease-out;
}

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

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--accent-color);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-light);
  font-size: 22px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-light);
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: 20px;
}

.modal-body p {
  margin-bottom: 20px;
  color: var(--text-light);
  font-size: 16px;
}

.settings-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-item {
  display: flex;
  align-items: center;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 16px;
  color: var(--text-light);
  user-select: none;
  position: relative;
  padding-left: 35px;
  line-height: 1.4;
}

.setting-checkbox {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  height: 20px;
  width: 20px;
  background-color: transparent;
  border: 2px solid var(--accent-color);
  border-radius: 4px;
  transition: all 0.2s ease;
}

.checkbox-container:hover .checkmark {
  background-color: rgba(255, 255, 255, 0.1);
}

.setting-checkbox:checked ~ .checkmark {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 6px;
  top: 2px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.setting-checkbox:checked ~ .checkmark:after {
  display: block;
}

.setting-label {
  margin-left: 8px;
  font-weight: 400;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid var(--accent-color);
}

.cancel-btn {
  padding: 8px 16px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background-color: #545b62;
  transform: translateY(-1px);
}

.save-btn {
  padding: 8px 16px;
  background-color: var(--accent-color);
  color: var(--text-light);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.save-btn:hover:not(:disabled) {
  opacity: 0.8;
  transform: translateY(-1px);
}

.save-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Responsive design for mobile */
@media (max-width: 768px) {
  .modal-content {
    margin: 0.5rem;
    width: calc(100% - 1rem);
  }

  .modal-header h3 {
    font-size: 18px;
  }

  .modal-footer {
    flex-direction: column;
    gap: 8px;
  }

  .cancel-btn,
  .save-btn {
    width: 100%;
  }

  .checkbox-container {
    font-size: 14px;
  }

  .setting-label {
    line-height: 1.3;
  }
}
</style>