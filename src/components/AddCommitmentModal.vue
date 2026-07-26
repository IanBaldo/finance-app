<!-- src/components/AddCommitmentModal.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { useFinanceStore } from '../store/finance';

const emit = defineEmits(['close']);
const store = useFinanceStore();

const form = ref({
  description: '',
  cardId: 'nubank',
  totalAmount: 0,
  installments: 1,
  recurring: false
});

const submit = () => {
  if (!form.value.description || form.value.totalAmount <= 0) return;
  store.addCommitment({ 
    ...form.value, 
    purchaseDate: new Date().toISOString().split('T')[0] // auto-generate current date under the hood
  });
  emit('close');
};
</script>

<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="base-card modal-content">
      <h3 class="mb-6">Add New Commitment</h3>
      
      <form @submit.prevent="submit" class="grid gap-4">
        <div>
          <label class="block text-sm mb-2 text-secondary">Description</label>
          <input v-model="form.description" type="text" class="base-input" required />
        </div>
        
        <div>
          <label class="block text-sm mb-2 text-secondary">Card</label>
          <select v-model="form.cardId" class="base-input">
            <option v-for="card in store.cards" :key="card.id" :value="card.id">{{ card.name }}</option>
          </select>
        </div>

        <div class="grid grid-2-col gap-4 items-end">
          <div>
            <label class="block text-sm mb-2 text-secondary">Total Amount (R$)</label>
            <input v-model.number="form.totalAmount" type="number" step="0.01" class="base-input" required />
          </div>
          <div class="flex items-center gap-2 mb-2">
            <input v-model="form.recurring" type="checkbox" id="recurring" />
            <label for="recurring" class="text-sm">Recurring Subscription</label>
          </div>
        </div>

        <div v-if="!form.recurring">
          <label class="block text-sm mb-2 text-secondary">Installments</label>
          <input v-model.number="form.installments" type="number" min="1" class="base-input" required />
        </div>

        <div class="flex justify-between mt-6 gap-4">
          <button type="button" @click="$emit('close')" class="btn-secondary w-full">Cancel</button>
          <button type="submit" class="btn-primary w-full">Save</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(17, 24, 39, 0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
}
.modal-content {
  width: 100%; max-width: 500px;
  max-height: 90vh; overflow-y: auto;
}
.mb-6 { margin-bottom: 24px; }
.mb-2 { margin-bottom: 8px; }
.mt-6 { margin-top: 24px; }
.block { display: block; }
.w-full { width: 100%; }
.grid-2-col { grid-template-columns: 1fr 1fr; }

.base-input {
  border: 1px solid var(--border);
  border-radius: 6px; padding: 8px 12px;
  font-family: var(--font-sans); width: 100%;
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