<!-- src/components/FormattedNumberInput.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  modelValue: number;
  className?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: number): void;
}>();

const isFocused = ref(false);

// pt-BR: period as thousands sep, comma as decimal
const formatted = computed(() =>
  new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(props.modelValue ?? 0)
);

// While editing we keep a local raw string
const localRaw = ref('');

const displayValue = computed(() =>
  isFocused.value ? localRaw.value : formatted.value
);

const onFocus = (e: FocusEvent) => {
  // Show the plain number so the user can edit it directly
  localRaw.value = props.modelValue != null ? String(props.modelValue) : '';
  isFocused.value = true;
  // Select all text for convenient overwrite
  (e.target as HTMLInputElement).select();
};

const onInput = (e: Event) => {
  localRaw.value = (e.target as HTMLInputElement).value;
};

const onBlur = () => {
  isFocused.value = false;
  // Strip any accidentally pasted formatting characters
  const cleaned = localRaw.value.replace(/[^\d.,-]/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  emit('update:modelValue', isNaN(parsed) ? 0 : parsed);
};
</script>

<template>
  <input
    type="text"
    inputmode="numeric"
    :value="displayValue"
    :class="className"
    @focus="onFocus"
    @input="onInput"
    @blur="onBlur"
  />
</template>
