<template>
  <div class="multi-range">
    <!-- Toggle checkbox -->
    <div class="toggle-checkbox">
      <input
          type="checkbox"
          :id="toggleId"
          v-model="isEnabled"
          @change="handleToggle"
      >
      <label :for="toggleId">{{ checkboxLabel }}</label>
    </div>

    <!-- Input controls -->
    <div class="input-controls" :class="{ 'disabled': !isEnabled }">
      <div class="input-group">
        <label>{{ inputLabel }}</label>
        <input
            type="number"
            v-model.number="minValue"
            :min="min"
            :max="max"
            @input="validateMin"
            class="number-input"
            :disabled="!isEnabled"
        >
      </div>
    </div>

    <!-- Multi-handle slider -->
    <div class="slider-container" :class="{ 'disabled': !isEnabled }">
      <!-- Base track -->
      <div class="slider-track"></div>

      <!-- Selected range -->
      <div
          class="slider-fill"
          :style="rangeStyle"
      ></div>

      <!-- Handle for minimum value -->
      <div
          class="slider-handle handle-min"
          :style="{ left: minHandlePosition, cursor: isEnabled ? 'pointer' : 'not-allowed' }"
          @mousedown="startDragging('min', $event)"
          @touchstart="startDragging('min', $event)"
      >
        <div class="handle-tooltip">{{ tooltipText }}</div>
      </div>
    </div>

    <!-- Range labels -->
    <div class="range-labels">
      <span>{{ minLabel }}</span>
      <span>{{ maxLabel }}</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: {
      type: Number,
      default: -1
    },
    enabledModelValue: {
      type: Boolean,
      default: false
    },
    checkboxLabel: {
      type: String,
      default: 'Force discount'
    },
    inputLabel: {
      type: String,
      default: 'Minimum discount in %'
    },
    min: {
      type: Number,
      default: -100
    },
    max: {
      type: Number,
      default: -1
    },
    minLabel: {
      type: String,
      default: '-100%'
    },
    maxLabel: {
      type: String,
      default: '-1%'
    },
    tooltipSuffix: {
      type: String,
      default: '%'
    },
    sliderType: {
      type: String,
      default: 'discount' // 'discount' or 'percentage'
    }
  },

  data() {
    return {
      minValue: this.modelValue,
      isDragging: null,
      startX: 0,
      startLeft: 0,
      sliderWidth: 0,
      isEnabled: this.enabledModelValue
    };
  },

  created() {
    // Initialize minValue properly
    if (this.modelValue !== undefined && this.modelValue !== null) {
      this.minValue = this.modelValue;
    } else {
      // Set default value based on slider type
      this.minValue = this.sliderType === 'percentage' ? this.max : this.max;
    }
  },

  computed: {
    minHandlePosition() {
      const range = Math.abs(this.max - this.min);
      const normalizedValue = Math.abs(this.minValue - this.min);
      return `${(normalizedValue / range) * 100}%`;
    },
    rangeStyle() {
      const range = Math.abs(this.max - this.min);
      const normalizedValue = Math.abs(this.minValue - this.min);
      const position = (normalizedValue / range) * 100;

      if (this.sliderType === 'percentage') {
        return {
          left: `${position}%`,
          width: `${100 - position}%`,
          opacity: this.isEnabled ? '1' : '0.5'
        };
      } else {
        return {
          left: '0',
          width: `${position}%`,
          opacity: this.isEnabled ? '1' : '0.5'
        };
      }
    },
    tooltipText() {
      return `${this.minValue}${this.tooltipSuffix}`;
    },
    toggleId() {
      return `toggle-${Math.random().toString(36).substr(2, 9)}`;
    }
  },

  methods: {
    handleToggle() {
      this.$emit('update:enabledModelValue', this.isEnabled);

      if (!this.isEnabled) {
        // When disabling, reset to default value based on slider type
        if (this.sliderType === 'percentage') {
          this.minValue = this.max; // For percentage, default to max (100)
        } else {
          this.minValue = this.max; // For discount, default to max (-1)
        }
        this.$emit('update:modelValue', this.minValue);
      }
      // When enabling, keep the current value (don't emit anything)
    },

    startDragging(handle, event) {
      if (!this.isEnabled) return;

      event.preventDefault();
      this.isDragging = handle;

      const slider = this.$el.querySelector('.slider-container');
      const rect = slider.getBoundingClientRect();
      this.sliderWidth = rect.width;

      if (event.type === 'mousedown') {
        this.startX = event.clientX;
      } else if (event.type === 'touchstart') {
        this.startX = event.touches[0].clientX;
      }

      document.addEventListener('mousemove', this.handleDrag);
      document.addEventListener('mouseup', this.stopDragging);
      document.addEventListener('touchmove', this.handleDrag);
      document.addEventListener('touchend', this.stopDragging);
    },

    handleDrag(event) {
      if (!this.isDragging || !this.isEnabled) return;

      let clientX;
      if (event.type === 'mousemove') {
        clientX = event.clientX;
      } else if (event.type === 'touchmove') {
        clientX = event.touches[0].clientX;
      }

      const slider = this.$el.querySelector('.slider-container');
      const rect = slider.getBoundingClientRect();
      const position = Math.min(Math.max(0, (clientX - rect.left) / rect.width * 100), 100);
      const value = Math.round(this.percentToValue(position));

      if (this.isDragging === 'min') {
        this.minValue = Math.max(this.min, Math.min(this.max, value));
        this.$emit('update:modelValue', this.minValue);
      }
    },

    stopDragging() {
      this.isDragging = null;
      document.removeEventListener('mousemove', this.handleDrag);
      document.removeEventListener('mouseup', this.stopDragging);
      document.removeEventListener('touchmove', this.handleDrag);
      document.removeEventListener('touchend', this.stopDragging);
    },

    percentToValue(position) {
      const range = Math.abs(this.max - this.min);
      return Math.round(this.min + (position / 100) * range);
    },

    validateMin() {
      if (!this.isEnabled) return;
      let value = parseInt(this.minValue);
      if (isNaN(value)) value = this.min;
      value = Math.max(this.min, Math.min(this.max, value));
      this.minValue = value;
      this.$emit('update:modelValue', value);
    }
  },

  watch: {
    modelValue(newValue) {
      this.minValue = newValue;
    },
    enabledModelValue(newValue) {
      this.isEnabled = newValue;
    },
    isEnabled(newValue) {
      if (!newValue) {
        this.minValue = this.sliderType === 'percentage' ? this.min : this.max;
        this.$emit('update:modelValue', this.minValue);
        this.$emit('update:enabledModelValue', false);
      } else {
        this.$emit('update:enabledModelValue', true);
      }
    }
  },

  beforeDestroy() {
    this.stopDragging();
  }
}</script>

<style>
.multi-range {
  padding: 20px;
  width: 100%;
}

.toggle-checkbox {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-checkbox input[type="checkbox"] {
  cursor: pointer;
  width: 16px;
  height: 16px;
}

.toggle-checkbox label {
  cursor: pointer;
  user-select: none;
}

.input-controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 20px;
}

.input-controls.disabled {
  opacity: 0.5;
}

.input-group {
  flex: 1;
}

.input-group label {
  display: block;
  margin-bottom: 5px;
}

.number-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.number-input:disabled {
  background-color: #f1f5f9;
  cursor: not-allowed;
}

.slider-container {
  position: relative;
  height: 40px;
  padding: 10px 0;
}

.slider-container.disabled {
  opacity: 0.5;
}

.slider-track {
  position: absolute;
  width: 100%;
  height: 4px;
  background-color: #e2e8f0;
  border-radius: 2px;
}

.slider-fill {
  position: absolute;
  height: 4px;
  background-color: #3b82f6;
  border-radius: 2px;
  transition: opacity 0.2s ease;
}

.slider-handle {
  position: absolute;
  width: 20px;
  height: 20px;
  background: white;
  border: 2px solid #3b82f6;
  border-radius: 50%;
  transform: translate(-50%, -8px);
  z-index: 2;
  transition: all 0.2s ease;
}

.slider-handle:hover .handle-tooltip {
  opacity: 1;
}

.handle-tooltip {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: #1f2937;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
}

.range-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  font-size: 14px;
  color: #6b7280;
}
</style>