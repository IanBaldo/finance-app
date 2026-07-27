<script setup lang="ts">
import { useFinanceStore } from '../store/finance';
import { formatBRLWhole, formatPercent } from '../utils/formatters';

const store = useFinanceStore();
</script>

<template>
  <div class="app-card">
    <h3 class="mb-5">Income Allocation</h3>

    <!-- Stacked bar -->
    <div class="allocation-bar">
      <div class="segment seg-fixed"    :style="{ width: formatPercent(store.fixedExpenses, store.income) }"></div>
      <div class="segment seg-credit"   :style="{ width: formatPercent(store.monthlyCommitments, store.income) }"></div>
      <div class="segment seg-savings"  :style="{ width: formatPercent(store.savingsTargetAmount, store.income) }"></div>
      <div class="segment seg-available":style="{ width: formatPercent(store.availableToSpend - store.savingsTargetAmount, store.income) }"></div>
    </div>

    <!-- Legend: all four items on one line -->
    <div class="legend-row mt-4">
      <div class="legend-item">
        <span class="dot seg-fixed"></span>
        <div>
          <div class="is-size-7 text-secondary">Fixed Expenses ({{ formatPercent(store.fixedExpenses, store.income) }})</div>
          <div class="has-text-weight-semibold">{{ formatBRLWhole(store.fixedExpenses) }}</div>
        </div>
      </div>
      <div class="legend-item">
        <span class="dot seg-credit"></span>
        <div>
          <div class="is-size-7 text-secondary">Credit Cards ({{ formatPercent(store.monthlyCommitments, store.income) }})</div>
          <div class="has-text-weight-semibold">{{ formatBRLWhole(store.monthlyCommitments) }}</div>
        </div>
      </div>
      <div class="legend-item">
        <span class="dot seg-savings"></span>
        <div>
          <div class="is-size-7 text-secondary">Savings Goal ({{ formatPercent(store.savingsTargetAmount, store.income) }})</div>
          <div class="has-text-weight-semibold">{{ formatBRLWhole(store.savingsTargetAmount) }}</div>
        </div>
      </div>
      <div class="legend-item">
        <span class="dot seg-available"></span>
        <div>
          <div class="is-size-7 text-secondary">Remaining ({{ formatPercent(store.availableToSpend - store.savingsTargetAmount, store.income) }})</div>
          <div class="has-text-weight-semibold">{{ formatBRLWhole(store.availableToSpend - store.savingsTargetAmount) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.allocation-bar {
  display: flex;
  height: 22px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--border);
}

.segment { height: 100%; transition: width 0.3s ease; }
.seg-fixed     { background: var(--text-primary); }
.seg-credit    { background: var(--warning); }
.seg-savings   { background: var(--success); }
.seg-available { background: var(--primary); }

.legend-row {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.legend-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: var(--text-secondary);
  flex: 1;
  min-width: 140px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 3px;
}
</style>
