<!-- src/components/UnsavedChangesModal.vue -->
<script setup lang="ts">
import { useFinanceStore } from '../../store/finance';

const store = useFinanceStore();

const handleExportCSVAndClose = () => {
  store.exportDataCSV();
  store.showUnsavedModal = false;
};

const handleCloseAnyway = () => {
  store.showUnsavedModal = false;
  store.isDataSaved = true;
  window.onbeforeunload = null;
  if (window.electronAPI?.closeApp) {
    window.electronAPI.closeApp();
  } else {
    window.close();
  }
};
</script>

<template>
  <div v-if="store.showUnsavedModal" class="modal-backdrop">
    <div class="base-card modal-content">
      <h3 class="mb-2">Unsaved Changes</h3>
      <p class="text-secondary mb-6 text-sm leading-relaxed">
        You have made modifications that haven't been exported to a CSV backup. What would you like to do?
      </p>
      <div class="flex flex-col gap-3">
        <button @click="handleExportCSVAndClose" class="btn-primary w-full">
          Export to CSV
        </button>
        
        <!-- Clean, explicitly centered button layout -->
        <button @click="handleCloseAnyway" class="btn-danger-enhanced w-full">
          <span class="btn-content-wrapper">
            <span>Close Anyway (Discard)</span>
          </span>
        </button>

        <button @click="store.showUnsavedModal = false" class="btn-secondary w-full">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-danger-enhanced {
  background: linear-gradient(to bottom, rgba(239, 68, 68, 0.08), rgba(239, 68, 68, 0.15));
  color: var(--danger);
  border: 1px solid rgba(239, 68, 68, 0.35);
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(239, 68, 68, 0.05);
  display: block;
  width: 100%;
  text-align: center;
}

.btn-content-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 auto;
}

.btn-danger-enhanced:hover {
  background: linear-gradient(to bottom, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.25));
  border-color: rgba(239, 68, 68, 0.6);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
  transform: translateY(-1px);
}

.btn-danger-enhanced:active {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.1);
}

</style>