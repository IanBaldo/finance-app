<script setup lang="ts">
import { ref } from 'vue';
import { useFinanceStore } from '../../store/finance';

const emit = defineEmits(['close', 'submit']);
const store = useFinanceStore();

const form = ref({
  name: '',
  currentBalance: 0,
  color: '#2563eb'
});

const submit = () => {
  if (!form.value.name) return;
  store.addCard(form.value);
  emit('close');
};
</script>

<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="base-card modal-content">
      <h3 class="mb-6">Add Card</h3>
      <form @submit.prevent="submit" class="grid gap-4">
        <div>
          <label class="block text-sm mb-2 text-secondary">Card Name</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="e.g. Itaú, XP Visa, C6"
            class="base-input"
            required
            autofocus
          />
        </div>

        <div>
          <label class="block text-sm mb-2 text-secondary">Current Balance (R$)</label>
          <input
            v-model.number="form.currentBalance"
            type="number"
            step="0.01"
            placeholder="0.00"
            class="base-input"
          />
        </div>

        <!-- Color Picker Field -->
        <div>
          <label class="block text-sm mb-2 text-secondary">Card Theme Color</label>
          <div class="flex items-center gap-3">
            <input
              v-model="form.color"
              type="color"
              class="color-picker-input"
            />
            <input
              v-model="form.color"
              type="text"
              class="base-input flex-1 uppercase"
              placeholder="#2563eb"
              maxlength="7"
            />
          </div>
        </div>

        <div class="flex justify-between mt-6 gap-4">
          <button type="button" @click="$emit('close')" class="btn-secondary w-full">Cancel</button>
          <button type="submit" class="btn-primary w-full">Add Card</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.base-input {
  border: 1px solid var(--border);
  border-radius: 6px; padding: 8px 12px;
  font-family: var(--font-sans); width: 100%;
  background: var(--surface);
  color: var(--text-primary);
}

.base-input:focus { outline: none; border-color: var(--primary); }

.color-picker-input {
  -webkit-appearance: none;
  border: 1px solid var(--border);
  width: 42px;
  height: 42px;
  border-radius: 8px;
  cursor: pointer;
  background: var(--surface);
  padding: 4px;
}

.color-picker-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-picker-input::-webkit-color-swatch {
  border: 1px solid var(--border);
  border-radius: 6px;
}
</style>