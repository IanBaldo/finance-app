<!-- src/components/AddExpenseModal.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { useFinanceStore } from '../store/finance';

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
    <div class="base-card modal-content">
      <h3 class="mb-6">Add Fixed Expense</h3>

      <form @submit.prevent="submit" class="grid gap-4">
        <div>
          <label class="block text-sm mb-2 text-secondary">Expense Name</label>
          <input
            v-model="name"
            type="text"
            placeholder="e.g. Rent, Gym, Internet, Water"
            class="base-input"
            required
            autofocus
          />
        </div>

        <div class="grid grid-2-col gap-4">
          <div>
            <label class="block text-sm mb-2 text-secondary">Expected Amount (R$)</label>
            <input
              v-model.number="expected"
              type="number"
              step="0.01"
              placeholder="0.00"
              class="base-input"
              required
            />
          </div>
          <div>
            <label class="block text-sm mb-2 text-secondary">Actual Amount (R$)</label>
            <input
              v-model.number="actual"
              type="number"
              step="0.01"
              placeholder="0.00"
              class="base-input"
            />
          </div>
        </div>

        <div class="flex justify-between mt-6 gap-4">
          <button type="button" @click="$emit('close')" class="btn-secondary w-full">Cancel</button>
          <button type="submit" class="btn-primary w-full">Add Expense</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(17, 24, 39, 0.5);
  backdrop-filter: blur(2px);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
}
.modal-content {
  width: 100%; max-width: 440px;
  padding: 24px;
}
.mb-6 { margin-bottom: 24px; }
.mb-2 { margin-bottom: 8px; }
.mt-6 { margin-top: 24px; }
.block { display: block; }
.w-full { width: 100%; }
.grid-2-col { display: grid; grid-template-columns: 1fr 1fr; }

.base-input {
  border: 1px solid var(--border);
  border-radius: 6px; padding: 8px 12px;
  font-family: var(--font-sans); width: 100%;
  background: var(--surface);
  color: var(--text-primary);
}
.base-input:focus { outline: none; border-color: var(--primary); }

.btn-secondary {
  background: var(--surface); color: var(--text-primary);
  border: 1px solid var(--border); padding: 8px 16px;
  border-radius: 6px; font-weight: 500; cursor: pointer;
}
.btn-secondary:hover { background: var(--bg); }
.btn-primary {
  background: var(--primary); color: white;
  border: none; padding: 8px 16px;
  border-radius: 6px; font-weight: 500; cursor: pointer;
}
.btn-primary:hover { opacity: 0.9; }
</style>
