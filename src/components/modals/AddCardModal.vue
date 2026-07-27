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
    <div class="app-card modal-box">
      <h3 class="mb-5">Add Card</h3>

      <form @submit.prevent="submit">
        <!-- Card Name -->
        <div class="field">
          <label class="label is-small text-secondary">Card Name</label>
          <div class="control">
            <input
              v-model="form.name"
              type="text"
              placeholder="e.g. Itaú, XP Visa, C6"
              class="input is-small"
              required
              autofocus
            />
          </div>
        </div>

        <!-- Current Balance -->
        <div class="field">
          <label class="label is-small text-secondary">Current Balance (R$)</label>
          <div class="control">
            <input
              v-model.number="form.currentBalance"
              type="number"
              step="0.01"
              placeholder="0.00"
              class="input is-small"
            />
          </div>
        </div>

        <!-- Color Picker -->
        <div class="field">
          <label class="label is-small text-secondary">Card Theme Color</label>
          <div class="control">
            <div class="is-flex is-align-items-center" style="gap: 10px;">
              <input v-model="form.color" type="color" class="color-picker-input" />
              <input
                v-model="form.color"
                type="text"
                class="input is-small"
                placeholder="#2563eb"
                maxlength="7"
                style="text-transform: uppercase; flex: 1;"
              />
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="buttons mt-5">
          <button type="button" @click="$emit('close')" class="button is-app-secondary is-fullwidth">Cancel</button>
          <button type="submit" class="button is-app-primary is-fullwidth">Add Card</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-box {
  width: 100%;
  max-width: 440px;
}
.input, .select select {
  font-family: var(--font-sans);
  color: var(--text-primary);
}
.label { color: var(--text-secondary); font-weight: 500; }
</style>