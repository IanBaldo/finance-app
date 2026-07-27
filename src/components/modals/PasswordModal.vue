<!-- src/components/PasswordModal.vue -->
<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';

const passwordInputRef = ref<HTMLInputElement | null>(null);

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

watch(() => props.show, async (newVal) => {
  if (newVal) {
    password.value = '';
    confirmPassword.value = '';
    validationError.value = '';
    enableEncryption.value = true;
    showPassword.value = false;
    await nextTick();
    passwordInputRef.value?.focus();
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
    <div class="app-card modal-box">
      <!-- Header -->
      <div class="is-flex is-align-items-center mb-4" style="gap: 8px;">
        <h3>{{ mode === 'export' ? '🔐 Export CSV Security' : '🔓 Encrypted File Detected' }}</h3>
      </div>

      <!-- Description -->
      <p class="is-size-7 text-secondary mb-4" style="line-height: 1.6;">
        <template v-if="mode === 'export'">
          Protect your sensitive financial data by setting a password. You will need this password to import the file later.
        </template>
        <template v-else>
          This backup file is encrypted with AES-256. Enter your password to decrypt and import your database.
        </template>
      </p>

      <!-- Encryption toggle (export only) -->
      <div v-if="mode === 'export'" class="field mb-4">
        <label class="checkbox is-size-7">
          <input type="checkbox" v-model="enableEncryption" />
          &nbsp;Encrypt file with password
        </label>
      </div>

      <!-- Password inputs -->
      <div v-if="mode === 'import' || enableEncryption">
        <!-- Password -->
        <div class="field">
          <label class="label is-small text-secondary">Password</label>
          <div class="control has-icons-right">
            <input
              ref="passwordInputRef"
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              placeholder="Enter password..."
              class="input is-small"
              @keyup.enter="handleSubmit"
            />
            <span class="icon is-small is-right" style="pointer-events: all; cursor: pointer;" @click="showPassword = !showPassword">
              <span class="is-size-7 text-secondary">{{ showPassword ? 'Hide' : 'Show' }}</span>
            </span>
          </div>
        </div>

        <!-- Confirm Password (export only) -->
        <div v-if="mode === 'export' && enableEncryption" class="field">
          <label class="label is-small text-secondary">Confirm Password</label>
          <div class="control">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="confirmPassword"
              placeholder="Confirm password..."
              class="input is-small"
              @keyup.enter="handleSubmit"
            />
          </div>
        </div>
      </div>

      <!-- Error message -->
      <div v-if="validationError || errorMessage" class="notification is-danger is-light is-size-7 py-2 px-3 mb-4" style="border-radius: 6px;">
        {{ validationError || errorMessage }}
      </div>

      <!-- Actions -->
      <div class="buttons mt-4">
        <button type="button" @click="emit('close')" class="button is-app-secondary is-fullwidth">Cancel</button>
        <button type="button" @click="handleSubmit" class="button is-app-primary is-fullwidth">
          {{ mode === 'export' ? (enableEncryption ? 'Encrypt & Export' : 'Export Plaintext') : 'Decrypt & Import' }}
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
.input {
  font-family: var(--font-sans);
  color: var(--text-primary);
}
.label { color: var(--text-secondary); font-weight: 500; }

/* Make icon clickable */
.icon.is-right { width: auto; padding-right: 8px; }
</style>
