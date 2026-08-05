<!-- src/App.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFinanceStore } from './store/finance';
import KpiCards from './components/KpiCards.vue';
import IncomeAllocation from './components/IncomeAllocation.vue';
import ProjectionChart from './components/ProjectionChart.vue';
import AddCommitmentModal from './components/modals/AddCommitmentModal.vue';
import UnsavedChangesModal from './components/modals/UnsavedChangesModal.vue';
import PasswordModal from './components/modals/PasswordModal.vue';
import AddCardModal from './components/modals/AddCardModal.vue';
import AddExpenseModal from './components/modals/AddExpenseModal.vue';
import { formatBRL, formatBRLWhole } from './utils/formatters';
import FormattedNumberInput from './components/FormattedNumberInput.vue';
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

const uploadedFile = ref<File | null>(null);

const handleSaveClick = async () => {
  if (store.loadedFileInfo) {
    const rawCsv = store.getCSVContent();
    const { fileName, isEncrypted, password } = store.loadedFileInfo;
    if (isEncrypted && password) {
      try {
        const encryptedContent = await encryptCsv(rawCsv, password);
        store.downloadCSVFile(encryptedContent, fileName);
      } catch (err: any) {
        passwordErrorMessage.value = 'Failed to encrypt export file.';
        console.error(err);
      }
    } else {
      store.downloadCSVFile(rawCsv, fileName);
    }
  } else {
    passwordModalMode.value = 'export';
    passwordErrorMessage.value = '';
    showPasswordModal.value = true;
  }
};

const handlePasswordSubmit = async ({ password, isEncrypted }: { password: string; isEncrypted: boolean }) => {
  if (passwordModalMode.value === 'export') {
    const rawCsv = store.getCSVContent();
    const defaultFileName = isEncrypted ? 'financial_database_encrypted.csv' : 'financial_database.csv';
    if (isEncrypted && password) {
      try {
        const encryptedContent = await encryptCsv(rawCsv, password);
        store.downloadCSVFile(encryptedContent, defaultFileName);
        store.loadedFileInfo = { fileName: defaultFileName, isEncrypted: true, password };
        showPasswordModal.value = false;
      } catch (err: any) {
        passwordErrorMessage.value = 'Failed to encrypt export file.';
      }
    } else {
      store.downloadCSVFile(rawCsv, defaultFileName);
      store.loadedFileInfo = { fileName: defaultFileName, isEncrypted: false };
      showPasswordModal.value = false;
    }
  } else {
    // Import mode
    try {
      passwordErrorMessage.value = '';
      const decryptedCsv = await decryptCsv(pendingImportContent.value, password);
      store.importDataCSV(decryptedCsv, {
        fileName: uploadedFile.value?.name || 'financial_database_encrypted.csv',
        isEncrypted: true,
        password
      });
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
    const file = target.files[0];
    uploadedFile.value = file;
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
          store.importDataCSV(content, {
            fileName: file.name,
            isEncrypted: false
          });
        }
      }
      target.value = '';
    };
    reader.readAsText(file);
  }
};
</script>

<template>
  <div class="dashboard-layout">
    <!-- Navbar -->
    <nav class="navbar app-navbar" role="navigation" aria-label="main navigation">
      <div class="container">
        <div class="navbar-brand">
          <span class="navbar-item">
            <h2>Financial Planning</h2>
          </span>
        </div>

        <div class="navbar-end">
          <div class="navbar-item" style="gap: 10px; display: flex; flex-wrap: wrap;">
            <!-- Month selector -->
            <div class="select is-small">
              <select v-model="store.activeMonthKey">
                <option v-for="m in store.availableMonths" :key="m.key" :value="m.key">
                  {{ m.label }}
                </option>
              </select>
            </div>

            <button @click="showCloseConfirm = true" class="button is-small is-app-secondary">Close Month</button>
            <button @click="handleSaveClick" class="button is-small is-app-secondary">Save</button>
            <button @click="fileInputRef?.click()" class="button is-small is-app-secondary">Import CSV</button>
            <input type="file" ref="fileInputRef" @change="handleFileUpload" accept=".csv" style="display: none;" />
          </div>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <main class="container py-5">
      <!-- Row 1: KPIs -->
      <KpiCards />

      <!-- Row 2: Income Allocation (full width) -->
      <div class="mt-5">
        <IncomeAllocation />
      </div>

      <!-- Row 3: Projection Chart (full width) -->
      <div class="mt-5">
        <ProjectionChart />
      </div>

      <!-- Row 3: Detail Sections -->
      <div class="columns mt-2">

        <!-- Commitments Section -->
        <div class="column is-8">
          <div class="app-card">
            <div class="level mb-5">
              <div class="level-left">
                <div class="level-item">
                  <h3>Active Commitments</h3>
                </div>
              </div>
              <div class="level-right">
                <div class="level-item">
                  <div class="buttons">
                    <button class="button is-small is-app-secondary" @click="showAddCardModal = true">+ Add Card</button>
                    <button class="button is-small is-app-primary" @click="showModal = true">+ Add Commitment</button>
                  </div>
                </div>
              </div>
            </div>

            <div v-for="card in store.cards" :key="card.id" class="card-section mb-4">
              <div class="level mb-3">
                <div class="level-left">
                  <div class="level-item">
                    <span class="card-title" :style="{ color: card.color }">{{ card.name }}</span>
                    <button @click="store.deleteCard(card.id)" class="btn-icon-danger ml-2" title="Delete Card">×</button>
                  </div>
                </div>
                <div class="level-right">
                  <div class="level-item">
                    <span class="text-secondary is-size-7 mr-2">Balance:</span>
                    <FormattedNumberInput v-model="card.currentBalance" class-name="inline-input w-28 has-text-right" />
                  </div>
                </div>
              </div>

              <div class="commitments-list">
                <div
                  v-for="c in store.commitments.filter(x => x.cardId === card.id)"
                  :key="c.id"
                  class="commitment-item"
                >
                  <div class="level is-mobile">
                    <div class="level-left">
                      <div class="level-item">
                        <div>
                          <div class="has-text-weight-semibold">{{ c.description }}</div>
                          <div class="is-size-7 text-secondary mt-1">
                            <span v-if="c.recurring">Recurring</span>
                            <span v-else>{{ c.currentInstallment }} of {{ c.installments }} installments</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="level-right">
                      <div class="level-item">
                        <div class="has-text-right mr-3">
                          <div class="has-text-weight-semibold">{{ formatBRLWhole(c.monthlyAmount) }} / mo</div>
                          <div class="is-size-7 text-secondary mt-1" v-if="!c.recurring">Total: {{ formatBRLWhole(c.totalAmount) }}</div>
                        </div>
                        <button @click="store.deleteCommitment(c.id)" class="btn-icon-danger" title="Remove Commitment">×</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="!store.commitments.filter(x => x.cardId === card.id).length" class="is-size-7 text-secondary py-3 px-2">
                  No active commitments.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Fixed Expenses Section -->
        <div class="column is-4">
          <div class="app-card">
            <div class="level mb-5">
              <div class="level-left">
                <div class="level-item">
                  <h3>Fixed Expenses</h3>
                </div>
              </div>
              <div class="level-right">
                <div class="level-item">
                  <button class="button is-small is-app-primary" @click="showAddExpenseModal = true">+ Add Expense</button>
                </div>
              </div>
            </div>

            <div class="expense-list">
              <div v-for="exp in store.expenses" :key="exp.id" class="expense-item mb-3" :class="{ 'is-paid': exp.paid }">
                <div class="level is-mobile mb-2">
                  <div class="level-left">
                    <div class="level-item">
                      <label class="checkbox-wrapper mr-2">
                        <input type="checkbox" v-model="exp.paid" @change="store.isDataSaved = false" class="checkbox-input" />
                        <span class="custom-checkbox"></span>
                      </label>
                      <span class="has-text-weight-semibold mr-2 expense-name" :class="{ 'is-strikethrough': exp.paid }">{{ exp.name }}</span>
                      <button @click="store.deleteExpense(exp.id)" class="btn-icon-danger" style="font-size:16px; width:24px; height:24px;" title="Remove Expense">×</button>
                    </div>
                  </div>
                  <div class="level-right">
                    <div class="level-item">
                      <span class="is-size-7 has-text-weight-medium" :class="{
                        'text-success': exp.actual < exp.expected,
                        'text-danger': exp.actual > exp.expected,
                        'text-secondary': exp.actual === exp.expected
                      }">
                        {{ exp.actual - exp.expected === 0 ? 'On Track' : formatBRL(Math.abs(exp.actual - exp.expected)) + (exp.actual > exp.expected ? ' Over' : ' Under') }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="columns is-mobile is-variable is-2">
                  <div class="column">
                    <label class="is-size-7 text-secondary mb-1" style="display:block;">Expected</label>
                    <input type="number" v-model.number="exp.expected" @change="store.isDataSaved = false" class="inline-input" style="width:100%;" />
                  </div>
                  <div class="column">
                    <label class="is-size-7 text-secondary mb-1" style="display:block;">Actual</label>
                    <input type="number" v-model.number="exp.actual" @change="store.isDataSaved = false" class="inline-input" style="width:100%;" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>

    <!-- Close Month Confirmation Modal -->
    <div v-if="showCloseConfirm" class="modal-backdrop" @click.self="showCloseConfirm = false">
      <div class="app-card modal-content-box">
        <h3 class="mb-4">Close Month Confirmation</h3>
        <p class="text-secondary mb-5 is-size-7" style="line-height:1.6;">
          Are you sure you want to close <strong>{{ store.currentMonthLabel }}</strong>? This will archive your financial snapshot, rollover your expected balance, advance installment tracking, and reset fixed expenses for the next month.
        </p>
        <div class="buttons">
          <button @click="showCloseConfirm = false" class="button is-app-secondary is-fullwidth">Cancel</button>
          <button @click="store.closeMonth(); showCloseConfirm = false" class="button is-app-primary is-fullwidth">Confirm Close</button>
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

    <AddCommitmentModal v-if="showModal" @close="showModal = false" />
  </div>
</template>

<style>
.dashboard-layout { min-height: 100vh; padding-bottom: 80px; }

/* Navbar */
.navbar.app-navbar { padding: 0; }
.navbar.app-navbar .container { padding: 0 24px; }

/* Modal content box */
.modal-content-box { width: 100%; max-width: 450px; }

/* Card title */
.card-title { font-size: 15px; font-weight: 600; }

/* Commitments list */
.commitments-list { display: flex; flex-direction: column; gap: 8px; }

/* Custom Checkbox */
.checkbox-wrapper {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}
.checkbox-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}
.custom-checkbox {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border);
  border-radius: 4px;
  display: inline-block;
  position: relative;
  transition: all 0.2s ease;
  background: var(--surface);
}
.checkbox-wrapper:hover .custom-checkbox {
  border-color: var(--primary);
}
.checkbox-input:checked + .custom-checkbox {
  background-color: var(--success);
  border-color: var(--success);
}
.checkbox-input:checked + .custom-checkbox::after {
  content: "";
  position: absolute;
  left: 5px;
  top: 1px;
  width: 5px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* Strikethrough for paid items */
.expense-name.is-strikethrough {
  text-decoration: line-through;
  color: var(--text-secondary);
  opacity: 0.7;
}

/* Paid expense item background styling */
.expense-item.is-paid {
  background-color: #F8FAFC !important;
}
</style>