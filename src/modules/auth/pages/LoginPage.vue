<template>
  <ion-page>
  <ion-content :fullscreen="true" class="login-page">
    <div class="login-bg" aria-hidden="true" />
    <main class="login-shell">
      <section class="login-card" aria-labelledby="login-title">
        <header class="brand-hero">
          <div class="brand-block">
            <div class="logo-badge" aria-hidden="true">
              <img src="/bovweight-logo-clean.png" alt="" />
            </div>

            <div class="brand-copy">
              <p>BovWeight <span>CR</span></p>
              <small>Estimación inteligente de peso ganadero</small>
            </div>
          </div>
        </header>

        <section class="login-panel">
          <h1 id="login-title" class="sr-only">Iniciar sesión en BovWeight CR</h1>

          <form class="login-form" novalidate @submit.prevent="handleLogin">

              <div class="field-group">
                <label for="email">
                  <ion-icon :icon="personCircleOutline" />
                  Correo o usuario
                </label>
                <div class="input-shell" :class="{ invalid: errorField === 'email' }">
                  <ion-icon class="field-icon" :icon="mailOutline" />
                  <ion-input
                    id="email"
                    v-model="email"
                    autocomplete="email"
                    inputmode="email"
                    placeholder="ejemplo@correo.com"
                    type="email"
                  />
                </div>
              </div>

              <div class="field-group">
                <label for="password">
                  <ion-icon :icon="lockClosed" />
                  Contraseña
                </label>
                <div class="input-shell password-shell" :class="{ invalid: errorField === 'password' }">
                  <ion-icon class="field-icon" :icon="lockClosedOutline" />
                  <ion-input
                    id="password"
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="current-password"
                    placeholder="Ingresa tu contraseña"
                  />
                  <button
                    class="password-toggle"
                    aria-label="Mostrar u ocultar contraseña"
                    type="button"
                    @click="showPassword = !showPassword"
                  >
                    <ion-icon :icon="showPassword ? eyeOffOutline : eyeOutline" />
                  </button>
                </div>
              </div>

              <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>

  <ion-button class="login-button" expand="block" type="submit" :disabled="isSubmitting">
    <ion-spinner v-if="isSubmitting" name="crescent" />
    <ion-icon v-else :icon="logInOutline" />
    <span>{{ isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión' }}</span>
  </ion-button>

            </form>

            <p class="support-text">¿Problemas para ingresar? Contactá al administrador.</p>
          </section>
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
import {
  eyeOffOutline,
  eyeOutline,
  lockClosed,
  lockClosedOutline,
  logInOutline,
  mailOutline,
  personCircleOutline,
} from 'ionicons/icons';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { getDefaultRouteForRole, login } from '@/modules/auth/services/sessionService';

const router = useRouter();
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const errorMessage = ref('');
const errorField = ref<'email' | 'password' | ''>('');
const isSubmitting = ref(false);

const validateForm = () => {
  if (!email.value.trim()) {
    errorField.value = 'email';
    return 'Ingrese su correo.';
  }

  if (!email.value.includes('@')) {
    errorField.value = 'email';
    return 'Ingrese un correo válido.';
  }

  if (!password.value) {
    errorField.value = 'password';
    return 'Ingrese su contraseña.';
  }

  errorField.value = '';
  return '';
};

const handleLogin = async () => {
  const validationError = validateForm();
  errorMessage.value = validationError;

  if (validationError) {
    return;
  }

  isSubmitting.value = true;

  try {
    const user = await login(email.value, password.value);
    if (user.mustChangePassword) {
      await router.replace('/cambiar-contrasena');
    } else {
      await router.replace(getDefaultRouteForRole(user.role));
    }
  } catch (error) {
    errorField.value = 'password';
    errorMessage.value = error instanceof Error ? error.message : 'No se pudo iniciar sesión.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.login-page {
  --background: transparent;
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

.login-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  background:
    linear-gradient(160deg, rgba(5, 43, 102, 0.92) 0%, rgba(7, 24, 50, 0.96) 60%, rgba(7, 24, 50, 0.98) 100%),
    url('/vaca.png') center / cover no-repeat;
  filter: saturate(90%) contrast(105%);
}

.login-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 10%, rgba(139, 183, 229, 0.22), transparent 35%),
    radial-gradient(circle at 80% 90%, rgba(47, 117, 181, 0.16), transparent 40%);
}

.login-shell {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding:
    max(48px, var(--bw-safe-top))
    20px
    max(48px, var(--bw-safe-bottom));
  position: relative;
  z-index: 1;
  box-sizing: border-box;
}

.login-card {
  width: 100%;
  max-width: 460px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow:
    0 32px 80px rgba(2, 14, 32, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  animation: cardEnter 540ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes cardEnter {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.brand-hero {
  position: relative;
  display: flex;
  justify-content: center;
  padding: 34px 28px 26px;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 0%, rgba(139, 183, 229, 0.28), transparent 45%),
    linear-gradient(180deg, var(--bw-primary) 0%, var(--bw-navy) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
}

.brand-hero::after {
  content: '';
  position: absolute;
  inset: auto 40px 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(139, 183, 229, 0.55), transparent);
}

.brand-block {
  display: grid;
  justify-items: center;
  gap: 12px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.logo-badge {
  position: relative;
  width: 120px;
  height: 100px;
  display: grid;
  place-items: center;
  border-radius: 32px;
  overflow: hidden;
  padding: 8px 12px;
  background: var(--bw-white);
  border: 1px solid rgba(8, 37, 74, 0.08);
  box-shadow: 0 18px 40px rgba(8, 37, 74, 0.18);
}

.logo-badge img {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.brand-copy p {
  margin: 0;
  color: var(--bw-white);
  font-size: 30px;
  font-weight: 900;
  letter-spacing: -0.5px;
  line-height: 1;
}

.brand-copy p span {
  color: var(--bw-sky);
}

.brand-copy small {
  display: block;
  margin-top: 5px;
  color: var(--bw-sky-soft);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.25;
}

.login-panel {
  position: relative;
  flex: 0 1 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 34px 0 0;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  padding: 0 32px;
}

.field-group {
  margin-bottom: 16px;
}

.field-group label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: var(--bw-text);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.2px;
}

.field-group label ion-icon {
  color: var(--bw-primary);
  font-size: 17px;
}

.input-shell {
  width: 100%;
  min-height: 50px;
  display: flex;
  align-items: center;
  overflow: hidden;
  box-sizing: border-box;
  border: 1px solid rgba(7, 24, 50, 0.18);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 8px 22px rgba(7, 24, 50, 0.06);
  transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
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

.login-form ion-input {
  width: 100%;
  flex: 1;
  --background: transparent;
  --color: var(--bw-text);
  --placeholder-color: var(--bw-text-secondary);
  --placeholder-opacity: 1;
  --padding-bottom: 0;
  --padding-end: 12px;
  --padding-start: 8px;
  --padding-top: 0;
  min-height: 48px;
  font-size: 14px;
}

.field-icon {
  flex: 0 0 auto;
  margin-left: 14px;
  color: var(--bw-icon-muted);
  font-size: 20px;
}

.password-shell ion-input {
  --padding-end: 4px;
}

.password-toggle {
  width: 44px;
  height: 48px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border: 0;
  background: transparent;
  color: var(--bw-text);
  font-size: 20px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 120ms ease;
}

.password-toggle:focus-visible {
  outline: 2px solid var(--bw-primary);
  outline-offset: -2px;
}

.password-toggle:active {
  background: rgba(5, 43, 102, 0.08);
}

.login-button {
  --background: var(--bw-primary);
  --background-activated: var(--bw-navy);
  --background-focused: var(--bw-navy);
  --background-hover: var(--bw-navy);
  --border-radius: 14px;
  --box-shadow: 0 18px 34px rgba(5, 43, 102, 0.22);
  --color: var(--bw-white);
  min-height: 52px;
  margin-top: 4px;
  font-weight: 900;
  font-size: 15px;
  text-transform: none;
  letter-spacing: 0.2px;
}

.login-button::part(native) {
  gap: 10px;
}

.login-button ion-spinner {
  color: var(--bw-white);
}

.form-error {
  margin: -10px 0 14px;
  color: var(--bw-error-text);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.4;
}

.support-text {
  margin: 26px 32px 32px;
  text-align: center;
  color: var(--bw-text-secondary);
  font-size: 12px;
  font-weight: 600;
}

.support-text a {
  color: var(--bw-accent);
  font-weight: 800;
  text-decoration: none;
}

@media (max-width: 430px) {
  .login-shell {
    align-items: stretch;
    padding:
      max(18px, var(--bw-safe-top))
      14px
      max(18px, var(--bw-safe-bottom));
  }

  .login-card {
    max-width: none;
    border-radius: 24px;
    box-shadow:
      0 24px 60px rgba(2, 14, 32, 0.38),
      inset 0 1px 0 rgba(255, 255, 255, 0.6);
  }

  .brand-hero {
    padding: 22px 22px 18px;
  }

  .brand-block {
    gap: 9px;
  }

  .logo-badge {
    width: 92px;
    height: 76px;
    border-radius: 24px;
    padding: 6px 10px;
  }

  .brand-copy p {
    font-size: 24px;
  }

  .brand-copy small {
    margin-top: 3px;
    font-size: 11px;
  }

  .login-panel {
    padding-top: 22px;
  }

  .login-form {
    padding: 0 24px;
  }

  .field-group {
    margin-bottom: 12px;
  }

  .field-group label {
    font-size: 11px;
  }

  .input-shell {
    min-height: 44px;
    border-radius: 12px;
  }

  .login-form ion-input {
    min-height: 42px;
    font-size: 13px;
  }

  .field-icon {
    margin-left: 12px;
    font-size: 18px;
  }

  .password-toggle {
    width: 40px;
    height: 42px;
  }

  .login-button {
    min-height: 46px;
    font-size: 14px;
  }

  .support-text {
    margin: 20px 24px 24px;
    font-size: 11px;
  }
}

@media (max-height: 760px) {
  .brand-hero {
    padding-top: 18px;
    padding-bottom: 14px;
  }

  .logo-badge {
    width: 84px;
    height: 70px;
  }

  .brand-copy p {
    font-size: 22px;
  }

  .login-panel {
    padding-top: 18px;
  }
}

@media (prefers-color-scheme: dark) {
  .login-card {
    background: rgba(11, 24, 44, 0.82);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow:
      0 32px 80px rgba(0, 0, 0, 0.55),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }

  .brand-hero {
    border-bottom-color: rgba(255, 255, 255, 0.08);
  }

  .input-shell {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.12);
  }

  .input-shell:focus-within {
    background: rgba(255, 255, 255, 0.12);
  }

  .login-form ion-input {
    --color: var(--bw-white);
    --placeholder-color: var(--bw-sky);
  }

  .field-group label,
  .forgot-button,
  .support-text {
    color: var(--bw-sky-soft);
  }
}
</style>
