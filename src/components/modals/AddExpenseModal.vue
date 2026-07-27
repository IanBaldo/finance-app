<!-- src/components/AddExpenseModal.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { useFinanceStore } from '../../store/finance';

const emit = defineEmits(['close']);
const store = useFinanceStore();

const name = ref('');
const expected = ref<number>(0);
const actual = ref<number>(0);

const submit = () => {
  if (!name.value.trim()) return;
  store.addExpense({
    name: name.value.trim(),
    expected: Number(expected.value) || 0,
    actual: Number(actual.value) || 0
  });
  emit('close');
};
</script>

<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="app-card modal-box">
      <h3 class="mb-5">Add Fixed Expense</h3>

      <form @submit.prevent="submit">
        <!-- Expense Name -->
        <div class="field">
          <label class="label is-small text-secondary">Expense Name</label>
          <div class="control">
            <input
              v-model="name"
              type="text"
              placeholder="e.g. Rent, Gym, Internet, Water"
              class="input is-small"
              required
              autofocus
            />
          </div>
        </div>

        <!-- Amounts -->
        <div class="columns is-mobile is-variable is-3">
          <div class="column">
            <div class="field">
              <label class="label is-small text-secondary">Expected (R$)</label>
              <div class="control">
                <input
                  v-model.number="expected"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  class="input is-small"
                  required
                />
              </div>
            </div>
          </div>
          <div class="column">
            <div class="field">
              <label class="label is-small text-secondary">Actual (R$)</label>
              <div class="control">
                <input
                  v-model.number="actual"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  class="input is-small"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="buttons mt-5">
          <button type="button" @click="$emit('close')" class="button is-app-secondary is-fullwidth">Cancel</button>
          <button type="submit" class="button is-app-primary is-fullwidth">Add Expense</button>
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
.input {
  font-family: var(--font-sans);
  color: var(--text-primary);
}
.label { color: var(--text-secondary); font-weight: 500; }
</style>
