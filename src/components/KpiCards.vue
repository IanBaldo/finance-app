<!-- src/components/KpiCards.vue -->
<script setup lang="ts">
import { useFinanceStore } from '../store/finance';
import { formatBRLWhole } from '../utils/formatters';
import FormattedNumberInput from './FormattedNumberInput.vue';

const store = useFinanceStore();
</script>

<template>
  <div class="columns is-multiline is-mobile kpi-row">
    <!-- Current Balance -->
    <div class="column is-one-fifth-desktop is-full-tablet is-full-mobile">
      <div class="app-card kpi-card">
        <p class="is-size-7 text-secondary mb-2">Current Balance (R$)</p>
        <div class="kpi-value is-flex is-align-items-center">
          <span class="is-size-6 text-secondary mr-1" style="font-weight: 400;">R$</span>
          <FormattedNumberInput
            v-model="store.balance"
            class-name="kpi-input"
          />
        </div>
      </div>
    </div>

    <!-- Monthly Income -->
    <div class="column is-one-fifth-desktop is-half-tablet is-half-mobile">
      <div class="app-card kpi-card">
        <p class="is-size-7 text-secondary mb-2">Monthly Income (R$)</p>
        <div class="kpi-value is-flex is-align-items-center">
          <span class="is-size-6 text-secondary mr-1" style="font-weight: 400;">R$</span>
          <FormattedNumberInput
            v-model="store.income"
            class-name="kpi-input"
          />
        </div>
      </div>
    </div>

    <!-- Committed -->
    <div class="column is-one-fifth-desktop is-half-tablet is-half-mobile">
      <div class="app-card kpi-card">
        <p class="is-size-7 text-secondary mb-2">Committed</p>
        <div class="kpi-value">{{ formatBRLWhole(store.monthlyCommitments + store.fixedExpenses) }}</div>
      </div>
    </div>

    <!-- Available to Spend -->
    <div class="column is-one-fifth-desktop is-half-tablet is-half-mobile">
      <div class="app-card kpi-card">
        <p class="is-size-7 text-secondary mb-2">Available to Spend</p>
        <div class="kpi-value text-primary-color">{{ formatBRLWhole(store.availableToSpend) }}</div>
      </div>
    </div>

    <!-- Savings Goal -->
    <div class="column is-one-fifth-desktop is-half-tablet is-half-mobile">
      <div class="app-card kpi-card">
        <p class="is-size-7 text-secondary mb-2">Savings Goal (R$)</p>
        <div class="kpi-value is-flex is-align-items-center">
          <span class="is-size-6 text-secondary mr-1" style="font-weight: 400;">R$</span>
          <FormattedNumberInput
            v-model="store.savingsGoal"
            class-name="kpi-input"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kpi-row { margin-bottom: 0; }

.kpi-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 100%;
}

.kpi-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
}
</style>