<template>
  <div v-if="visible" class="modal-overlay" @click="handleClose">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button @click="handleClose" class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <p>{{ description }}</p>
        <textarea
            v-model="localImportData"
            :placeholder="placeholder"
            class="import-textarea"
            :rows="textareaRows"
        ></textarea>
        <div v-if="errorMessage" class="import-error">
          {{ errorMessage }}
        </div>
      </div>
      <div class="modal-footer">
        <button @click="handleClose" class="cancel-btn">{{ cancelText }}</button>
        <button
            @click="handleImport"
            class="import-submit-btn"
            :disabled="!localImportData.trim() || isLoading"
        >
          {{ isLoading ? loadingText : submitText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImportSkinsModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Import Items'
    },
    description: {
      type: String,
      default: 'Enter your items data as a JSON array:'
    },
    placeholder: {
      type: String,
      default: 'Enter JSON data here...'
    },
    cancelText: {
      type: String,
      default: 'Cancel'
    },
    submitText: {
      type: String,
      default: 'Import Items'
    },
    loadingText: {
      type: String,
      default: 'Importing...'
    },
    textareaRows: {
      type: Number,
      default: 12
    },
    errorMessage: {
      type: String,
      default: ''
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    importData: {
      type: String,
      default: ''
    }
  },
  emits: ['close', 'import', 'update:importData'],
  data() {
    return {
      localImportData: this.importData
    }
  },
  watch: {
    importData(newValue) {
      this.localImportData = newValue;
    },
    localImportData(newValue) {
      this.$emit('update:importData', newValue);
    }
  },
  methods: {
    handleClose() {
      this.$emit('close');
    },
    handleImport() {
      this.$emit('import', this.localImportData);
    }
  }
}
</script>

<style scoped>
/* Modal styles */
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
  max-width: 600px;
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
  margin-bottom: 12px;
  color: var(--text-light);
  font-size: 16px;
}

.import-textarea {
  width: 100%;
  border: 1px solid var(--accent-color);
  border-radius: 8px;
  padding: 12px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  resize: vertical;
  min-height: 200px;
  background-color: var(--color-background-mute);
  color: var(--text-light);
  box-sizing: border-box;
}

.import-textarea:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
}

.import-error {
  margin-top: 12px;
  padding: 8px 12px;
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  border: 1px solid #dc3545;
  border-radius: 8px;
  font-size: 14px;
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

.import-submit-btn {
  padding: 8px 16px;
  background-color: var(--accent-color);
  color: var(--text-light);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.import-submit-btn:hover:not(:disabled) {
  opacity: 0.8;
  transform: translateY(-1px);
}

.import-submit-btn:disabled {
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
  .import-submit-btn {
    width: 100%;
  }
}
</style>