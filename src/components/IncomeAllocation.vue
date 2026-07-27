<script setup lang="ts">
import { useFinanceStore } from '../store/finance';
import { formatBRL, formatPercent } from '../utils/formatters';

const store = useFinanceStore();
</script>

<template>
  <div class="base-card">
    <h3 class="mb-6">Income Allocation</h3>
    <div class="allocation-bar">
      <div class="segment fixed" :style="{ width: formatPercent(store.fixedExpenses, store.income) }"></div>
      <div class="segment credit" :style="{ width: formatPercent(store.monthlyCommitments, store.income) }"></div>
      <div class="segment savings" :style="{ width: formatPercent(store.savingsTargetAmount, store.income) }"></div>
      <div class="segment available" :style="{ width: formatPercent(store.availableToSpend - store.savingsTargetAmount, store.income) }"></div>
    </div>
    <div class="legend grid mt-6">
      <div class="legend-item">
        <div class="dot fixed"></div>
        <div>
          <div class="text-sm">Fixed Expenses ({{formatPercent(store.fixedExpenses, store.income)}})</div>
          <div class="font-semibold">{{ formatBRL(store.fixedExpenses) }}</div>
        </div>
      </div>
      <div class="legend-item">
        <div class="dot credit"></div>
        <div>
          <div class="text-sm">Credit Cards ({{formatPercent(store.monthlyCommitments, store.income)}})</div>
          <div class="font-semibold">{{ formatBRL(store.monthlyCommitments) }}</div>
        </div>
      </div>
      <div class="legend-item">
        <div class="dot savings"></div>
        <div>
          <div class="text-sm">Savings Goal ({{formatPercent(store.savingsTargetAmount, store.income)}})</div>
          <div class="font-semibold">{{ formatBRL(store.savingsTargetAmount) }}</div>
        </div>
      </div>
      <div class="legend-item">
        <div class="dot available"></div>
        <div>
          <div class="text-sm">Remaining Available ({{formatPercent(store.availableToSpend - store.savingsTargetAmount, store.income)}})</div>
          <div class="font-semibold">{{ formatBRL(store.availableToSpend - store.savingsTargetAmount) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mb-6 { margin-bottom: 24px; }
.allocation-bar {
  display: flex;
  height: 24px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--border);
}
.segment { height: 100%; transition: width 0.3s ease; }
.fixed { background: var(--text-primary); }
.credit { background: var(--warning); }
.savings { background: var(--success); }
.available { background: var(--primary); }

.legend {
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}
.legend-item { display: flex; align-items: flex-start; gap: 8px; color: var(--text-secondary); }
.font-semibold { font-weight: 600; color: var(--text-primary); }
.dot { width: 12px; height: 12px; border-radius: 50%; margin-top: 4px; }
</style>
