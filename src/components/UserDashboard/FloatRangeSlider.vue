<template>
  <div class="float-range-slider">
    <input
        type="number"
        class="frs-input"
        :value="minValue"
        :min="boundMin"
        :max="maxValue"
        step="0.001"
        placeholder="0.000"
        @change="onInputCommit('min', $event)"
    />

    <div class="frs-track" ref="trackEl">
      <div class="frs-rail"></div>
      <div class="frs-bound-fill" :style="boundFillStyle"></div>
      <div class="frs-fill" :style="fillStyle"></div>
      <div
          class="frs-handle"
          :style="{ left: toPercent(minValue) }"
          @pointerdown="startDrag('min', $event)"
      >
        <div class="frs-tooltip">{{ minValue.toFixed(3) }}</div>
      </div>
      <div
          class="frs-handle"
          :style="{ left: toPercent(maxValue) }"
          @pointerdown="startDrag('max', $event)"
      >
        <div class="frs-tooltip">{{ maxValue.toFixed(3) }}</div>
      </div>
    </div>

    <input
        type="number"
        class="frs-input"
        :value="maxValue"
        :min="minValue"
        :max="boundMax"
        step="0.001"
        placeholder="1.000"
        @change="onInputCommit('max', $event)"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import type { PropType } from 'vue';

type Handle = 'min' | 'max';

export default defineComponent({
  name: 'FloatRangeSlider',
  props: {
    minValue: { type: Number, required: true },
    maxValue: { type: Number, required: true },
    boundMin: { type: Number as PropType<number>, default: 0 },
    boundMax: { type: Number as PropType<number>, default: 1 },
  },
  emits: ['update:minValue', 'update:maxValue', 'change'],
  setup(props, { emit }) {
    const trackEl = ref<HTMLElement | null>(null);
    let dragging: Handle | null = null;

    const round = (value: number): number => Math.round(value * 1000) / 1000;

    const clamp = (value: number, min: number, max: number): number =>
        Math.min(max, Math.max(min, value));

    // The slider always renders on a 0-1 scale so users see where the skin's
    // allowed range sits within the full float spectrum.
    const toPercent = (value: number): string => `${clamp(value, 0, 1) * 100}%`;

    const boundFillStyle = computed<Record<string, string>>(() => {
      const left = clamp(props.boundMin, 0, 1) * 100;
      const width = Math.max(0, (clamp(props.boundMax, 0, 1) - clamp(props.boundMin, 0, 1)) * 100);
      return { left: `${left}%`, width: `${width}%` };
    });

    const fillStyle = computed<Record<string, string>>(() => {
      const left = clamp(props.minValue, 0, 1) * 100;
      const width = Math.max(0, (clamp(props.maxValue, 0, 1) - clamp(props.minValue, 0, 1)) * 100);
      return { left: `${left}%`, width: `${width}%` };
    });

    const setValue = (handle: Handle, rawValue: number): void => {
      if (handle === 'min') {
        const value = round(clamp(rawValue, props.boundMin, props.maxValue));
        if (value !== props.minValue) emit('update:minValue', value);
      } else {
        const value = round(clamp(rawValue, props.minValue, props.boundMax));
        if (value !== props.maxValue) emit('update:maxValue', value);
      }
    };

    const valueFromPointer = (event: PointerEvent): number => {
      const track = trackEl.value;
      if (!track) return 0;
      const rect = track.getBoundingClientRect();
      return clamp((event.clientX - rect.left) / rect.width, 0, 1);
    };

    const onPointerMove = (event: PointerEvent): void => {
      if (!dragging) return;
      setValue(dragging, valueFromPointer(event));
    };

    const onPointerUp = (): void => {
      if (!dragging) return;
      dragging = null;
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      emit('change');
    };

    const startDrag = (handle: Handle, event: PointerEvent): void => {
      event.preventDefault();
      dragging = handle;
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
    };

    const onInputCommit = (handle: Handle, event: Event): void => {
      const input = event.target as HTMLInputElement;
      const parsed = parseFloat(input.value);
      const fallback = handle === 'min' ? props.boundMin : props.boundMax;
      setValue(handle, Number.isFinite(parsed) ? parsed : fallback);
      // Reflect the clamped value back into the input
      input.value = (handle === 'min' ? props.minValue : props.maxValue).toFixed(3);
      emit('change');
    };

    return {
      trackEl,
      toPercent,
      startDrag,
      onInputCommit,
      boundFillStyle,
      fillStyle,
    };
  },
});
</script>

<style scoped>
.float-range-slider {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 420px;
}

.frs-input {
  width: 76px;
  flex-shrink: 0;
  padding: 6px 8px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-background);
  color: var(--color-text);
  font-size: 0.9rem;
}

.frs-track {
  position: relative;
  flex: 1;
  height: 24px;
  cursor: pointer;
  touch-action: none;
}

.frs-rail,
.frs-bound-fill,
.frs-fill {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 4px;
  border-radius: 2px;
}

.frs-rail {
  width: 100%;
  background-color: var(--color-border);
  opacity: 0.5;
}

.frs-bound-fill {
  background-color: var(--color-border);
}

.frs-fill {
  background-color: var(--accent-color, #4caf50);
}

.frs-handle {
  position: absolute;
  top: 50%;
  width: 16px;
  height: 16px;
  transform: translate(-50%, -50%);
  background-color: var(--color-background, #fff);
  border: 2px solid var(--accent-color, #4caf50);
  border-radius: 50%;
  z-index: 2;
  touch-action: none;
}

.frs-handle:hover .frs-tooltip,
.frs-handle:active .frs-tooltip {
  opacity: 1;
}

.frs-tooltip {
  position: absolute;
  top: -28px;
  left: 50%;
  transform: translateX(-50%);
  background: #1f2937;
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
}

@media (max-width: 768px) {
  .float-range-slider {
    max-width: none;
  }

  .frs-input {
    width: 72px;
    font-size: 16px; /* prevents iOS zoom */
  }
}
</style>
