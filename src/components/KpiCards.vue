<!-- src/components/KpiCards.vue -->
<script setup lang="ts">
import { useFinanceStore } from '../store/finance';

const store = useFinanceStore();
</script>

<template>
  <div class="kpi-grid">
    <!-- Editable Current Balance -->
    <div class="base-card kpi-card">
      <span class="text-secondary text-sm">Current Balance (R$)</span>
      <div class="kpi-value flex items-center">
        <span class="text-secondary font-normal text-base mr-1">R$</span>
        <input type="number" v-model.number="store.balance" class="kpi-input" />
      </div>
    </div>
    
    <div class="base-card kpi-card">
      <span class="text-secondary text-sm">Monthly Income (R$)</span>
      <div class="kpi-value flex items-center">
        <span class="text-secondary font-normal text-base mr-1">R$</span>
        <input type="number" v-model.number="store.income" class="kpi-input" />
      </div>
    </div>

    <div class="base-card kpi-card">
      <span class="text-secondary text-sm">Committed</span>
      <div class="kpi-value">{{ formatBRL(store.monthlyCommitments + store.fixedExpenses) }}</div>
    </div>

    <div class="base-card kpi-card">
      <span class="text-secondary text-sm">Available to Spend</span>
      <div class="kpi-value text-primary">{{ formatBRL(store.availableToSpend) }}</div>
    </div>

    <div class="base-card kpi-card">
      <span class="text-secondary text-sm">Savings Goal (R$)</span>
      <div class="kpi-value flex items-center">
        <span class="text-secondary font-normal text-base mr-1">R$</span>
        <input type="number" v-model.number="store.savingsGoal" class="kpi-input" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { formatBRL } from '../utils/formatters';
export default {
  methods: { formatBRL }
}
</script>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}
.kpi-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.kpi-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
}
.text-primary { color: var(--primary); }

.kpi-input {
  border: none;
  border-bottom: 1px dashed var(--border);
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  background: transparent;
  width: 100%;
  font-family: inherit;
  padding: 0;
}
.kpi-input:focus {
  outline: none;
  border-bottom-color: var(--primary);
}
</style>