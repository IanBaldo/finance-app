<!-- src/components/AddCommitmentModal.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { useFinanceStore } from '../../store/finance';

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
    purchaseDate: new Date().toISOString().split('T')[0]
  });
  emit('close');
};
</script>

<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="app-card modal-box">
      <h3 class="mb-5">Add New Commitment</h3>

      <form @submit.prevent="submit">
        <!-- Description -->
        <div class="field">
          <label class="label is-small text-secondary">Description</label>
          <div class="control">
            <input v-model="form.description" type="text" class="input is-small" required />
          </div>
        </div>

        <!-- Card -->
        <div class="field">
          <label class="label is-small text-secondary">Card</label>
          <div class="control">
            <div class="select is-small is-fullwidth">
              <select v-model="form.cardId">
                <option v-for="card in store.cards" :key="card.id" :value="card.id">{{ card.name }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Amount + Recurring toggle -->
        <div class="columns is-mobile is-variable is-3">
          <div class="column">
            <div class="field">
              <label class="label is-small text-secondary">Total Amount (R$)</label>
              <div class="control">
                <input v-model.number="form.totalAmount" type="number" step="0.01" class="input is-small" required />
              </div>
            </div>
          </div>
          <div class="column is-flex is-align-items-center" style="padding-top: 28px;">
            <label class="checkbox is-size-7">
              <input type="checkbox" v-model="form.recurring" />
              &nbsp;Recurring
            </label>
          </div>
        </div>

        <!-- Installments -->
        <div v-if="!form.recurring" class="field">
          <label class="label is-small text-secondary">Installments</label>
          <div class="control">
            <input v-model.number="form.installments" type="number" min="1" class="input is-small" required />
          </div>
        </div>

        <!-- Actions -->
        <div class="buttons mt-5">
          <button type="button" @click="$emit('close')" class="button is-app-secondary is-fullwidth">Cancel</button>
          <button type="submit" class="button is-app-primary is-fullwidth">Save</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-box {
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

/* Ensure Bulma input inherits our font */
.input, .select select {
  font-family: var(--font-sans);
  color: var(--text-primary);
}

.label { color: var(--text-secondary); font-weight: 500; }
</style>