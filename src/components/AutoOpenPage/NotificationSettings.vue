<template>
  <div class="settings-section">
    <div class="settings-header" @click="toggleSettings">
      <div class="settings-title">
        <span class="settings-icon">⚙️</span>
        <span>Notification Settings</span>
      </div>
      <span class="settings-toggle-icon" :class="{ 'rotated': showSettings }">▼</span>
    </div>

    <div v-if="showSettings" class="settings-content">
      <div class="setting-group">
        <h3>Deal Notification Sound</h3>
        <p class="setting-description">Choose a sound that will play when a new deal is found</p>

        <div class="sound-options">
          <div
              v-for="sound in soundOptions"
              :key="sound.id"
              class="sound-option"
              :class="{ 'selected': selectedSound === sound.id }"
          >
            <label class="sound-label">
              <input
                  type="radio"
                  :value="sound.id"
                  v-model="selectedSound"
                  @change="onSoundChange"
              />
              <span class="sound-name">{{ sound.name }}</span>
            </label>
            <button
                @click="playSampleSound(sound.path)"
                class="sample-btn"
                :disabled="isPlayingSample"
            >
              {{ isPlayingSample === sound.id ? '🔊' : '▶️' }} Sample
            </button>
          </div>
        </div>

        <div class="volume-control">
          <label for="volume-slider">Volume: {{ Math.round(notificationVolume * 100) }}%</label>
          <input
              id="volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.1"
              v-model="notificationVolume"
              class="volume-slider"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import VineBoomAudio from '@/assets/SoundEffects/VineBoom.mp3'
import SamsungNotification from '@/assets/SoundEffects/SamsungNotification.mp3'
import IphoneNotification from '@/assets/SoundEffects/IphoneNotification.mp3'
import BellSoundEffect from '@/assets/SoundEffects/BellSoundEffect.mp3'

export default {
  name: 'NotificationSettings',
  emits: ['log-message'],
  setup(props, { emit }) {
    // Settings variables
    const showSettings = ref(false);
    const selectedSound = ref('chime');
    const notificationVolume = ref(0.7);
    const isPlayingSample = ref(null);

    // Sound options - Update these paths with your actual audio file paths
    const soundOptions = ref([
      { id: 'chime', name: 'Vine boom', path: VineBoomAudio },
      { id: 'ding', name: 'Samsung notif', path: SamsungNotification },
      { id: 'notification', name: 'Iphone notif', path: IphoneNotification},
      { id: 'alert', name: 'Bell', path: BellSoundEffect },
    ]);

    // Settings functions
    function toggleSettings() {
      showSettings.value = !showSettings.value;
    }

    function playNotificationSound() {
      const selectedSoundOption = soundOptions.value.find(sound => sound.id === selectedSound.value);
      if (selectedSoundOption) {
        try {
          const audio = new Audio(selectedSoundOption.path);
          audio.volume = notificationVolume.value;
          audio.play().catch(error => {
            console.error('Failed to play notification sound:', error);
            emit('log-message', `Failed to play notification sound: ${error.message}`, 'error');
          });
        } catch (error) {
          console.error('Error creating audio for notification:', error);
          emit('log-message', `Error creating notification audio: ${error}`, 'error');
        }
      }
    }

    function playSampleSound(soundPath) {
      const soundId = soundOptions.value.find(sound => sound.path === soundPath)?.id;
      if (isPlayingSample.value) return;

      try {
        isPlayingSample.value = soundId || null;
        const audio = new Audio(soundPath);
        audio.volume = notificationVolume.value;

        audio.onended = () => {
          isPlayingSample.value = null;
        };

        audio.onerror = () => {
          isPlayingSample.value = null;
          emit('log-message', `Failed to play sample sound: ${soundPath}`, 'error');
        };

        audio.play().catch(error => {
          isPlayingSample.value = null;
          console.error('Failed to play sample sound:', error);
          emit('log-message', `Failed to play sample sound: ${error.message}`, 'error');
        });
      } catch (error) {
        isPlayingSample.value = null;
        console.error('Error creating sample audio:', error);
        emit('log-message', `Error creating sample audio: ${error}`, 'error');
      }
    }

    function onSoundChange() {
      const selectedSoundOption = soundOptions.value.find(sound => sound.id === selectedSound.value);
      if (selectedSoundOption) {
        emit('log-message', `Notification sound changed to: ${selectedSoundOption.name}`, 'info');
        // Save to localStorage
        localStorage.setItem('selectedNotificationSound', selectedSound.value);
      }
    }

    // Load saved settings
    function loadSettings() {
      const savedSound = localStorage.getItem('selectedNotificationSound');
      if (savedSound && soundOptions.value.find(sound => sound.id === savedSound)) {
        selectedSound.value = savedSound;
      }

      const savedVolume = localStorage.getItem('notificationVolume');
      if (savedVolume) {
        notificationVolume.value = parseFloat(savedVolume);
      }
    }

    // Save volume when it changes
    function saveVolume() {
      localStorage.setItem('notificationVolume', notificationVolume.value.toString());
    }

    // Watch for volume changes to save them
    watch(notificationVolume, saveVolume);

    // Load settings when component mounts
    onMounted(() => {
      loadSettings();
    });

    // Expose the playNotificationSound function so parent can call it
    const exposedMethods = {
      playNotificationSound
    };

    // Return exposed values and functions
    return {
      showSettings,
      toggleSettings,
      selectedSound,
      notificationVolume,
      soundOptions,
      isPlayingSample,
      playSampleSound,
      onSoundChange,
      ...exposedMethods
    };
  }
};
</script>

<style scoped>
/* Settings Section */
.settings-section {
  margin: 30px 0;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  background: #f8f9fa;
  overflow: hidden;
}

.settings-header {
  background: #343a40;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.settings-header:hover {
  background: #495057;
}

.settings-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #f8f9fa;
  font-weight: 600;
  font-size: 16px;
}

.settings-icon {
  font-size: 18px;
}

.settings-toggle-icon {
  color: #f8f9fa;
  font-size: 14px;
  transition: transform 0.3s ease;
}

.settings-toggle-icon.rotated {
  transform: rotate(180deg);
}

.settings-content {
  padding: 25px;
}

.setting-group {
  text-align: left;
}

.setting-group h3 {
  margin: 0 0 8px 0;
  color: #343a40;
  font-size: 18px;
  font-weight: 600;
}

.setting-description {
  margin: 0 0 20px 0;
  color: #6c757d;
  font-size: 14px;
}

.sound-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 25px;
}

/* Fixed alignment for sound options */
.sound-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background: #fff;
  transition: all 0.2s ease;
  min-height: 50px;
}

.sound-option:hover {
  border-color: #dee2e6;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.sound-option.selected {
  border-color: #2196F3;
  background: #e3f2fd;
}

/* Improved label alignment */
.sound-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  flex: 1;
  min-width: 0; /* Allows text to shrink */
}

.sound-label input[type="radio"] {
  margin: 0;
  width: 18px;
  height: 18px;
  cursor: pointer;
  flex-shrink: 0; /* Prevents radio button from shrinking */
}

.sound-name {
  font-weight: 500;
  color: #343a40;
  line-height: 1.4;
  flex: 1;
}

/* Improved sample button alignment */
.sample-btn {
  padding: 8px 16px;
  border: 1px solid #2196F3;
  background: #2196F3;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 90px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-shrink: 0; /* Prevents button from shrinking */
}

.sample-btn:hover:not(:disabled) {
  background: #1976D2;
  border-color: #1976D2;
  transform: translateY(-1px);
}

.sample-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.volume-control {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 20px;
}

.volume-control label {
  font-weight: 500;
  color: #343a40;
  font-size: 14px;
}

.volume-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e9ecef;
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #2196F3;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.volume-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #2196F3;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* Responsive design for settings */
@media (max-width: 768px) {
  .sound-option {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
    padding: 15px;
  }

  .sound-label {
    justify-content: center;
    gap: 10px;
  }

  .sample-btn {
    align-self: center;
    min-width: 120px;
  }
}

/* Better focus states for accessibility */
.sound-label input[type="radio"]:focus {
  outline: 2px solid #2196F3;
  outline-offset: 2px;
}

.sample-btn:focus {
  outline: 2px solid #2196F3;
  outline-offset: 2px;
}
</style>