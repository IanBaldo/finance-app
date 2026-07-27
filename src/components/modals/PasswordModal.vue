<!-- src/components/PasswordModal.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  show: boolean;
  mode: 'export' | 'import';
  errorMessage?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', payload: { password: string; isEncrypted: boolean }): void;
}>();

const enableEncryption = ref(true);
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const validationError = ref('');

watch(() => props.show, (newVal) => {
  if (newVal) {
    password.value = '';
    confirmPassword.value = '';
    validationError.value = '';
    enableEncryption.value = true;
    showPassword.value = false;
  }
});

const handleSubmit = () => {
  validationError.value = '';

  if (props.mode === 'export') {
    if (!enableEncryption.value) {
      emit('submit', { password: '', isEncrypted: false });
      return;
    }

    if (!password.value) {
      validationError.value = 'Please enter a password to encrypt your file.';
      return;
    }

    if (password.value !== confirmPassword.value) {
      validationError.value = 'Passwords do not match.';
      return;
    }

    emit('submit', { password: password.value, isEncrypted: true });
  } else {
    // Import mode
    if (!password.value) {
      validationError.value = 'Please enter the decryption password.';
      return;
    }

    emit('submit', { password: password.value, isEncrypted: true });
  }
};
</script>

<template>
  <div v-if="show" class="modal-backdrop">
    <div class="base-card modal-content">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold flex items-center gap-2">
          <span>{{ mode === 'export' ? '🔐 Export CSV Security' : '🔓 Encrypted File Detected' }}</span>
        </h3>
      </div>

      <p class="text-secondary text-sm mb-4 leading-relaxed">
        <template v-if="mode === 'export'">
          Protect your sensitive financial data by setting a password. You will need this password to import the file later.
        </template>
        <template v-else>
          This backup file is encrypted with AES-256. Enter your password to decrypt and import your database.
        </template>
      </p>

      <!-- Export Mode Encryption Toggle -->
      <div v-if="mode === 'export'" class="mb-4 flex items-center gap-3">
        <label class="flex items-center gap-2 cursor-pointer text-sm font-medium select-none">
          <input type="checkbox" v-model="enableEncryption" class="accent-primary w-4 h-4 rounded" />
          <span>Encrypt file with password</span>
        </label>
      </div>

      <!-- Password Inputs -->
      <div v-if="mode === 'import' || enableEncryption" class="flex flex-col gap-3 mb-4">
        <div>
          <label class="block text-xs text-secondary mb-1">Password</label>
          <div class="relative">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              placeholder="Enter password..."
              class="w-full input-field pr-10"
              @keyup.enter="handleSubmit"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-secondary hover:text-white"
            >
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
        </div>

        <div v-if="mode === 'export' && enableEncryption">
          <label class="block text-xs text-secondary mb-1">Confirm Password</label>
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="confirmPassword"
            placeholder="Confirm password..."
            class="w-full input-field"
            @keyup.enter="handleSubmit"
          />
        </div>
      </div>

      <!-- Errors -->
      <div v-if="validationError || errorMessage" class="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-400 text-xs">
        {{ validationError || errorMessage }}
      </div>

      <!-- Buttons -->
      <div class="flex gap-3">
        <button type="button" @click="emit('close')" class="btn-secondary flex-1">
          Cancel
        </button>
        <button type="button" @click="handleSubmit" class="btn-primary flex-1">
          {{ mode === 'export' ? (enableEncryption ? 'Encrypt & Export' : 'Export Plaintext') : 'Decrypt & Import' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-content {
  width: 100%;
  max-width: 420px;
  padding: 24px;
  border-radius: 12px;
}

.input-field {
  background: var(--bg-card, #1e293b);
  border: 1px solid var(--border-color, #334155);
  color: #f8fafc;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.input-field:focus {
  border-color: var(--primary, #3b82f6);
}
</style>
