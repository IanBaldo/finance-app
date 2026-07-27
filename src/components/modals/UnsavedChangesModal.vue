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
    <div class="app-card modal-box">
      <h3 class="mb-3">Unsaved Changes</h3>
      <p class="is-size-7 text-secondary mb-5" style="line-height: 1.6;">
        You have made modifications that haven't been exported to a CSV backup. What would you like to do?
      </p>

      <div class="is-flex is-flex-direction-column" style="gap: 10px;">
        <button @click="handleExportCSVAndClose" class="button is-app-primary is-fullwidth">
          Export to CSV
        </button>

        <button @click="handleCloseAnyway" class="button is-app-danger is-fullwidth">
          Close Anyway (Discard)
        </button>

        <button @click="store.showUnsavedModal = false" class="button is-app-secondary is-fullwidth">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-box {
  width: 100%;
  max-width: 420px;
}
</style>