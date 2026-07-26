<!-- src/App.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFinanceStore } from './store/finance';
import KpiCards from './components/KpiCards.vue';
import IncomeAllocation from './components/IncomeAllocation.vue';
import ProjectionChart from './components/ProjectionChart.vue';
import AddCommitmentModal from './components/AddCommitmentModal.vue';
import UnsavedChangesModal from './components/UnsavedChangesModal.vue';
import PasswordModal from './components/PasswordModal.vue';
import AddCardModal from './components/AddCardModal.vue';
import AddExpenseModal from './components/AddExpenseModal.vue';
import { formatBRL } from './utils/formatters';
import { isEncryptedFile, encryptCsv, decryptCsv } from './utils/crypto';

const store = useFinanceStore();
const showModal = ref(false);
const showAddCardModal = ref(false);
const showAddExpenseModal = ref(false);
const showCloseConfirm = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

// Password modal state for export / import encryption
const showPasswordModal = ref(false);
const passwordModalMode = ref<'export' | 'import'>('export');
const passwordErrorMessage = ref('');
const pendingImportContent = ref('');

const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (!store.isDataSaved) {
    e.preventDefault();
    e.returnValue = '';
    store.showUnsavedModal = true;
  }
};

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload);
});

const handleExportClick = () => {
  passwordModalMode.value = 'export';
  passwordErrorMessage.value = '';
  showPasswordModal.value = true;
};

const handlePasswordSubmit = async ({ password, isEncrypted }: { password: string; isEncrypted: boolean }) => {
  if (passwordModalMode.value === 'export') {
    const rawCsv = store.getCSVContent();
    if (isEncrypted && password) {
      try {
        const encryptedContent = await encryptCsv(rawCsv, password);
        store.downloadCSVFile(encryptedContent, 'financial_database_encrypted.csv');
        showPasswordModal.value = false;
      } catch (err: any) {
        passwordErrorMessage.value = 'Failed to encrypt export file.';
      }
    } else {
      store.exportDataCSV();
      showPasswordModal.value = false;
    }
  } else {
    // Import mode
    try {
      passwordErrorMessage.value = '';
      const decryptedCsv = await decryptCsv(pendingImportContent.value, password);
      store.importDataCSV(decryptedCsv);
      showPasswordModal.value = false;
      pendingImportContent.value = '';
    } catch (err: any) {
      passwordErrorMessage.value = err.message || 'Incorrect password.';
    }
  }
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const content = e.target.result as string;
        if (isEncryptedFile(content)) {
          pendingImportContent.value = content;
          passwordModalMode.value = 'import';
          passwordErrorMessage.value = '';
          showPasswordModal.value = true;
        } else {
          store.importDataCSV(content);
        }
      }
      target.value = '';
    };
    reader.readAsText(target.files[0]);
  }
};
</script>

<template>
  <div class="dashboard-layout">
    <header class="top-nav">
      <div class="container nav-content flex items-center justify-between">
        <h2>Financial Planning</h2>
        <div class="flex items-center gap-4">
          <!-- Active Month / History Selector -->
          <select v-model="store.activeMonthKey" class="month-selector">
            <option v-for="m in store.availableMonths" :key="m.key" :value="m.key">
              {{ m.label }}
            </option>
          </select>
          
          <!-- Close Month Button -->
          <button @click="showCloseConfirm = true" class="btn-secondary">Close Month</button>
          
          <!-- Export Data Button -->
          <button @click="handleExportClick" class="btn-secondary">Export Data</button>

          <!-- Import Data Button -->
          <button @click="fileInputRef?.click()" class="btn-secondary">Import CSV</button>
          <input type="file" ref="fileInputRef" @change="handleFileUpload" accept=".csv" style="display: none;" />
        </div>
      </div>
    </header>

    <main class="container content-grid">
      <!-- Row 1: KPIs -->
      <KpiCards />

      <!-- Row 2: Charts -->
      <IncomeAllocation />
      <ProjectionChart />

      <!-- Row 3: Detail Sections -->
      <div class="grid layout-3-col mt-6">
        
        <!-- Commitments Section -->
        <div class="base-card span-2">
          <div class="flex justify-between items-center mb-8">
            <h3>Active Commitments</h3>
            <div class="flex gap-4">
              <button class="btn-secondary" @click="showAddCardModal = true">+ Add Card</button>
              <button class="btn-primary" @click="showModal = true">+ Add Commitment</button>
            </div>
          </div>
          
          <div v-for="card in store.cards" :key="card.id" class="mb-6 card-section">
            <div class="flex justify-between items-center mb-4 card-header-row">
              <div class="flex items-center gap-3">
                <h4 class="text-secondary card-title" :style="{ color: card.color}">{{ card.name }}</h4>
                <button @click="store.deleteCard(card.id)" class="btn-icon-danger text-xs" title="Delete Card">x</button>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm text-secondary">Balance:</span>
                <input type="number" v-model.number="card.currentBalance" class="inline-input w-28 text-right" />
              </div>
            </div>

            <div class="commitments-list">
              <div v-for="c in store.commitments.filter(x => x.cardId === card.id)" :key="c.id" class="commitment-item">
                <div class="flex justify-between items-center">
                  <div>
                    <div class="font-semibold">{{ c.description }}</div>
                    <div class="text-sm text-secondary mt-1">
                      <span v-if="c.recurring">Recurring</span>
                      <span v-else>{{ c.currentInstallment }} of {{ c.installments }} installments</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="text-right">
                      <div class="font-semibold">{{ formatBRL(c.monthlyAmount) }} / mo</div>
                      <div class="text-sm text-secondary mt-1" v-if="!c.recurring">Total: {{ formatBRL(c.totalAmount) }}</div>
                    </div>
                    <button @click="store.deleteCommitment(c.id)" class="btn-icon-danger" title="Remove Commitment">×</button>
                  </div>
                </div>
              </div>
              <div v-if="!store.commitments.filter(x => x.cardId === card.id).length" class="text-sm text-secondary py-3 px-2">
                No active commitments.
              </div>
            </div>
          </div>
        </div>

        <!-- Fixed Expenses Section -->
        <div class="base-card">
          <div class="flex justify-between items-center mb-8">
            <h3>Fixed Expenses</h3>
            <button class="btn-primary" @click="showAddExpenseModal = true">+ Add Expense</button>
          </div>
          <div class="expenses-list grid gap-4">
            <div v-for="exp in store.expenses" :key="exp.id" class="expense-item flex flex-col gap-2">
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                  <div class="font-semibold">{{ exp.name }}</div>
                  <button @click="store.deleteExpense(exp.id)" class="btn-icon-danger btn-xs" title="Remove Expense">x</button>
                </div>
                <div class="text-sm font-medium" :class="{
                  'text-success': exp.actual < exp.expected,
                  'text-danger': exp.actual > exp.expected,
                  'text-secondary': exp.actual === exp.expected
                }">
                  {{ exp.actual - exp.expected === 0 ? 'On Track' : formatBRL(Math.abs(exp.actual - exp.expected)) + (exp.actual > exp.expected ? ' Over' : ' Under') }}
                </div>
              </div>
              
              <div class="flex items-center justify-between mt-2 gap-4">
                <div class="flex flex-col w-full">
                  <label class="text-xs text-secondary mb-1">Expected</label>
                  <input type="number" v-model.number="exp.expected" class="inline-input w-full" />
                </div>
                <div class="flex flex-col w-full">
                  <label class="text-xs text-secondary mb-1">Actual</label>
                  <input type="number" v-model.number="exp.actual" class="inline-input w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    <!-- Close Month Confirmation Modal -->
    <div v-if="showCloseConfirm" class="modal-backdrop" @click.self="showCloseConfirm = false">
      <div class="base-card modal-content">
        <h3 class="mb-6">Close Month Confirmation</h3>
        <p class="text-secondary mb-6 text-sm leading-relaxed">
          Are you sure you want to close <strong>{{ store.currentMonthLabel }}</strong>? This will archive your financial snapshot, rollover your expected balance, advance installment tracking, and reset fixed expenses for the next month.
        </p>
        <div class="flex justify-between gap-4">
          <button @click="showCloseConfirm = false" class="btn-secondary w-full">Cancel</button>
          <button @click="store.closeMonth(); showCloseConfirm = false" class="btn-primary w-full">Confirm Close</button>
        </div>
      </div>
    </div>

    <!-- Render Modal Components -->
    <UnsavedChangesModal />

    <PasswordModal
      :show="showPasswordModal"
      :mode="passwordModalMode"
      :error-message="passwordErrorMessage"
      @close="showPasswordModal = false"
      @submit="handlePasswordSubmit"
    />

    <AddCardModal v-if="showAddCardModal" @close="showAddCardModal = false" />

    <AddExpenseModal v-if="showAddExpenseModal" @close="showAddExpenseModal = false" />

    <button class="fab" @click="showModal = true" aria-label="Add Commitment">+</button>
    <AddCommitmentModal v-if="showModal" @close="showModal = false" />
  </div>
</template>

<style>
/* Keep your existing style blocks */
.btn-xs {
  width: 24px;
  height: 24px;
  font-size: 14px;
}
.dashboard-layout { min-height: 100vh; padding-bottom: 64px; }
.top-nav {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 16px 0;
  margin-bottom: 32px;
}
.container { max-width: 1280px; margin: 0 auto; padding: 0 24px; }
.content-grid { display: grid; gap: 24px; }
.layout-3-col { grid-template-columns: 2fr 1fr; gap: 24px; }
@media (max-width: 1279px) { .layout-3-col { grid-template-columns: 1fr; } }
@media (max-width: 768px) { .kpi-grid { grid-template-columns: 1fr 1fr; } }
.inline-input {
  border: 1px solid var(--border); border-radius: 6px; padding: 8px 12px;
  font-family: inherit; font-size: 14px; background: var(--surface); transition: all 0.2s;
}
.inline-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12); background: var(--bg); }
.w-28 { width: 110px; }
.w-full { width: 100%; }
.flex-col { flex-direction: column; }
.month-selector { border: 1px solid var(--border); border-radius: 6px; padding: 8px 12px; background: var(--surface); font-family: var(--font-sans); cursor: pointer; }
.icon-btn { background: none; border: none; font-size: 20px; cursor: pointer; }
.btn-primary { background: var(--primary); color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 500; cursor: pointer; transition: opacity 0.2s; }
.btn-primary:hover { opacity: 0.9; }
.btn-secondary { background: var(--surface); color: var(--text-primary); border: 1px solid var(--border); padding: 8px 16px; border-radius: 6px; font-weight: 500; cursor: pointer; }
.btn-secondary:hover { background: var(--bg); }
.modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(17, 24, 39, 0.5); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(2px); }
.modal-content { width: 100%; max-width: 450px; }
.btn-icon-danger { background: none; border: none; color: var(--text-secondary); font-size: 24px; cursor: pointer; border-radius: 6px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.btn-icon-danger:hover { color: var(--danger); background: var(--bg); }
.card-section { padding: 18px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface); }
.card-section:last-child { margin-bottom: 0; }
.card-title { font-size: 16px; font-weight: 600; }
.commitments-list { display: flex; flex-direction: column; gap: 10px; }
.commitment-item { background: var(--bg); padding: 16px 20px; border: 1px solid var(--border); border-radius: 10px; transition: border-color 0.2s; }
.commitment-item:hover { border-color: var(--primary); }
.expense-item { padding: 16px 18px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface); }
.font-semibold { font-weight: 600; }
.font-medium { font-weight: 500; }
.text-success { color: var(--success); }
.text-danger { color: var(--danger); }
.text-right { text-align: right; }
.leading-relaxed { line-height: 1.6; }
.fab { position: fixed; bottom: 32px; right: 32px; width: 56px; height: 56px; border-radius: 50%; background: var(--primary); color: white; border: none; font-size: 28px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.2s; z-index: 50; }
.fab:hover { transform: scale(1.05); }
.fab:focus-visible { outline: 2px solid var(--primary); outline-offset: 4px; }
</style>