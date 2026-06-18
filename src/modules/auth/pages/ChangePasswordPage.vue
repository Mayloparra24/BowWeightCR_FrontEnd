<template>
  <ion-page class="change-page">
    <ion-content :fullscreen="true">
      <main class="change-shell">
        <section class="change-card" aria-labelledby="change-title">
          <header class="change-header">
            <div class="logo-badge" aria-hidden="true">
              <img src="/bovweight-logo-clean.png" alt="" />
            </div>
            <h1 id="change-title">Cambiar contraseña</h1>
            <p>Es necesario actualizar tu contraseña temporal antes de continuar.</p>
          </header>

          <form class="change-form" novalidate @submit.prevent="handleSubmit">
            <div class="field-group">
              <label for="current-password">Contraseña actual</label>
              <div class="input-shell" :class="{ invalid: errorField === 'current' }">
                <ion-icon class="field-icon" :icon="lockClosedOutline" />
                <ion-input
                  id="current-password"
                  v-model="currentPassword"
                  :type="showCurrent ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="Tu contraseña temporal"
                />
                <button
                  class="password-toggle"
                  type="button"
                  aria-label="Mostrar u ocultar contraseña actual"
                  @click="showCurrent = !showCurrent"
                >
                  <ion-icon :icon="showCurrent ? eyeOffOutline : eyeOutline" />
                </button>
              </div>
            </div>

            <div class="field-group">
              <label for="new-password">Nueva contraseña</label>
              <div class="input-shell" :class="{ invalid: errorField === 'new' }">
                <ion-icon class="field-icon" :icon="lockClosedOutline" />
                <ion-input
                  id="new-password"
                  v-model="newPassword"
                  :type="showNew ? 'text' : 'password'"
                  autocomplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  class="password-toggle"
                  type="button"
                  aria-label="Mostrar u ocultar nueva contraseña"
                  @click="showNew = !showNew"
                >
                  <ion-icon :icon="showNew ? eyeOffOutline : eyeOutline" />
                </button>
              </div>
            </div>

            <div class="field-group">
              <label for="confirm-password">Confirmar nueva contraseña</label>
              <div class="input-shell" :class="{ invalid: errorField === 'confirm' }">
                <ion-icon class="field-icon" :icon="lockClosedOutline" />
                <ion-input
                  id="confirm-password"
                  v-model="confirmPassword"
                  :type="showConfirm ? 'text' : 'password'"
                  autocomplete="new-password"
                  placeholder="Repetí la nueva contraseña"
                />
                <button
                  class="password-toggle"
                  type="button"
                  aria-label="Mostrar u ocultar confirmación"
                  @click="showConfirm = !showConfirm"
                >
                  <ion-icon :icon="showConfirm ? eyeOffOutline : eyeOutline" />
                </button>
              </div>
            </div>

            <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>

            <ion-button class="change-button" expand="block" type="submit" :disabled="isSubmitting">
              <ion-spinner v-if="isSubmitting" name="crescent" />
              <span>{{ isSubmitting ? 'Guardando...' : 'Actualizar contraseña' }}</span>
            </ion-button>
          </form>
        </section>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonPage,
  IonSpinner,
} from '@ionic/vue';
import { eyeOffOutline, eyeOutline, lockClosedOutline } from 'ionicons/icons';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { changePassword, getDefaultRouteForRole } from '@/modules/auth/services/sessionService';

const router = useRouter();
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const showCurrent = ref(false);
const showNew = ref(false);
const showConfirm = ref(false);
const errorMessage = ref('');
const errorField = ref<'current' | 'new' | 'confirm' | ''>('');
const isSubmitting = ref(false);

const validate = () => {
  if (!currentPassword.value) {
    errorField.value = 'current';
    return 'Ingresá tu contraseña actual.';
  }
  if (newPassword.value.length < 8) {
    errorField.value = 'new';
    return 'La nueva contraseña debe tener al menos 8 caracteres.';
  }
  if (newPassword.value !== confirmPassword.value) {
    errorField.value = 'confirm';
    return 'Las contraseñas nuevas no coinciden.';
  }
  errorField.value = '';
  return '';
};

const handleSubmit = async () => {
  const validationError = validate();
  errorMessage.value = validationError;
  if (validationError) return;

  isSubmitting.value = true;
  try {
    const user = await changePassword({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
      newPasswordConfirmation: confirmPassword.value,
    });
    await router.replace(getDefaultRouteForRole(user.role));
  } catch (error) {
    errorField.value = '';
    errorMessage.value = error instanceof Error ? error.message : 'No se pudo cambiar la contraseña.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.change-page {
  --background: linear-gradient(160deg, #052b66 0%, #071832 100%);
}

.change-shell {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding:
    max(40px, var(--bw-safe-top))
    20px
    max(40px, var(--bw-safe-bottom));
  box-sizing: border-box;
}

.change-card {
  width: 100%;
  max-width: 420px;
  padding: 32px 28px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow:
    0 32px 80px rgba(2, 14, 32, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
}

.change-header {
  display: grid;
  justify-items: center;
  gap: 10px;
  text-align: center;
  margin-bottom: 28px;
}

.logo-badge {
  width: 84px;
  height: 70px;
  display: grid;
  place-items: center;
  border-radius: 22px;
  padding: 6px 10px;
  background: var(--bw-white);
  box-shadow: 0 12px 28px rgba(8, 37, 74, 0.14);
}

.logo-badge img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.change-header h1 {
  margin: 0;
  color: var(--bw-text);
  font-size: 22px;
  font-weight: 900;
}

.change-header p {
  margin: 0;
  color: var(--bw-text-secondary);
  font-size: 13px;
  line-height: 1.4;
}

.change-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field-group {
  display: grid;
  gap: 6px;
}

.field-group label {
  color: var(--bw-text);
  font-size: 12px;
  font-weight: 800;
}

.input-shell {
  width: 100%;
  min-height: 48px;
  display: flex;
  align-items: center;
  overflow: hidden;
  box-sizing: border-box;
  border: 1px solid rgba(7, 24, 50, 0.18);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
  transition: border-color 140ms ease, box-shadow 140ms ease, background 140ms ease;
}

.input-shell:focus-within {
  border-color: var(--bw-primary);
  background: var(--bw-white);
  box-shadow: 0 0 0 3px rgba(5, 43, 102, 0.12);
}

.input-shell.invalid {
  border-color: var(--bw-error);
  box-shadow: 0 0 0 3px rgba(217, 45, 32, 0.12);
}

.change-form ion-input {
  flex: 1;
  --background: transparent;
  --color: var(--bw-text);
  --placeholder-color: var(--bw-text-secondary);
  --placeholder-opacity: 1;
  --padding-start: 8px;
  --padding-end: 8px;
  min-height: 46px;
  font-size: 14px;
}

.field-icon {
  margin-left: 12px;
  color: var(--bw-icon-muted);
  font-size: 20px;
}

.password-toggle {
  width: 42px;
  height: 46px;
  display: grid;
  place-items: center;
  border: 0;
  background: transparent;
  color: var(--bw-text);
  font-size: 20px;
  cursor: pointer;
}

.form-error {
  margin: 0;
  color: var(--bw-error-text);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.4;
}

.change-button {
  --background: var(--bw-primary);
  --background-activated: var(--bw-navy);
  --background-focused: var(--bw-navy);
  --background-hover: var(--bw-navy);
  --border-radius: 12px;
  --box-shadow: 0 14px 28px rgba(5, 43, 102, 0.2);
  --color: var(--bw-white);
  min-height: 50px;
  margin-top: 6px;
  font-weight: 900;
  font-size: 15px;
  text-transform: none;
}

.change-button::part(native) {
  gap: 10px;
}

@media (max-width: 430px) {
  .change-card {
    padding: 26px 22px;
    border-radius: 20px;
  }

  .change-header h1 {
    font-size: 20px;
  }
}
</style>
