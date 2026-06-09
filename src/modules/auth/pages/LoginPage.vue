<template>
  <ion-page>
    <ion-content :fullscreen="true" class="login-page">
      <main class="login-shell">
        <section class="login-card" aria-labelledby="login-title">
          <header class="brand-hero">
            <div class="brand-block">
              <div class="logo-badge" aria-hidden="true">
                <img src="/bovweight-logo-clean.png" alt="" />
              </div>

              <div class="brand-copy">
                <p>BovWeight <span>CR</span></p>
                <small>Estimación de peso ganadero</small>
              </div>
            </div>
          </header>

          <section class="login-panel">
            <div class="login-heading">
              <h1 id="login-title">Bienvenido de nuevo</h1>
              <p>Inicia sesión para continuar</p>
            </div>

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
                    placeholder="Ingresa tu correo o usuario"
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

              <button class="forgot-button" type="button">¿Olvidaste tu contraseña?</button>

              <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>

              <ion-button class="login-button" expand="block" type="submit" :disabled="isSubmitting">
                <ion-spinner v-if="isSubmitting" name="crescent" />
                <span v-else>
                  <ion-icon :icon="shieldCheckmarkOutline" />
                  Iniciar sesión
                </span>
              </ion-button>
            </form>

            <div class="role-section">
              <div class="role-title">
                <span></span>
                <p>Selecciona tu rol</p>
                <span></span>
              </div>

              <div class="role-selector" aria-label="Selecciona tu rol">
                <button
                  v-for="role in roleOptions"
                  :key="role.value"
                  :class="{ active: selectedRole === role.value }"
                  type="button"
                  @click="selectRole(role.value)"
                >
                  <svg v-if="role.value === 'ganadero'" class="role-hat-icon" viewBox="0 0 28 20" aria-hidden="true">
                    <path d="M8.8 9.4c1.2-5.5 2.8-7.6 5.2-7.6s4 2.1 5.2 7.6" />
                    <path d="M3 11.4c3.2 3.8 18.8 3.8 22 0" />
                    <path d="M5 10.6c3.6 1.7 14.4 1.7 18 0" />
                    <path d="M2.2 10.6c1.9-2.1 4.1-2.3 6.6-1.2" />
                    <path d="M25.8 10.6c-1.9-2.1-4.1-2.3-6.6-1.2" />
                    <path d="M10.5 6.9c2.1 1.5 4.9 1.5 7 0" />
                  </svg>
                  <ion-icon v-else :icon="role.icon" />
                  {{ role.label }}
                </button>
              </div>
            </div>

            <p class="support-text">¿No tienes una cuenta? <a href="#">Contactar a soporte</a></p>
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
  mailOutline,
  medicalOutline,
  personCircleOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { getDefaultRouteForRole, login } from '@/modules/auth/services/sessionService';
import type { UserRole } from '@/shared/types/domain';

const router = useRouter();
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const errorMessage = ref('');
const errorField = ref<'email' | 'password' | ''>('');
const isSubmitting = ref(false);
const selectedRole = ref<UserRole>('ganadero');

const roleOptions = [
  {
    value: 'admin',
    label: 'Admin',
    icon: personCircleOutline,
  },
  {
    value: 'ganadero',
    label: 'Ganadero',
  },
  {
    value: 'veterinario',
    label: 'Veterinario',
    icon: medicalOutline,
  },
] satisfies Array<{ value: UserRole; label: string; icon?: string }>;

const selectRole = (role: UserRole) => {
  selectedRole.value = role;
  errorMessage.value = '';
  errorField.value = '';
};

const validateForm = () => {
  if (!email.value.trim()) {
    errorField.value = 'email';
    return 'Ingrese su correo o usuario.';
  }

  if (!email.value.includes('@')) {
    errorField.value = 'email';
    return 'Ingrese un correo válido.';
  }

  if (password.value.length < 6) {
    errorField.value = 'password';
    return 'La contraseña debe tener al menos 6 caracteres.';
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
    await router.replace(getDefaultRouteForRole(user.role));
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
  --background: linear-gradient(180deg, #062a1f 0%, #0f3f2a 30%, #153f2b 60%, #294f3a 100%);
  position: relative;
  min-height: 100vh;
}

.login-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 10% 20%, rgba(255,255,255,0.03), transparent 8%),
    radial-gradient(circle at 90% 80%, rgba(255,255,255,0.02), transparent 12%),
    linear-gradient(180deg, rgba(8,42,31,0.65), rgba(11,40,30,0.45));
  pointer-events: none;
  z-index: 0;
}
.login-shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  position: relative;
  z-index: 1;
}

.login-card {
  width: 100%;
  max-width: 460px;
  min-height: min(812px, calc(100vh - 44px));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 20px;
  background: rgba(255,255,255,0.92);
  border: none;
  backdrop-filter: blur(6px) saturate(110%);
  -webkit-backdrop-filter: blur(6px) saturate(110%);
  box-shadow: 0 30px 80px rgba(2,12,8,0.5);
}

.brand-hero {
  display: flex;
  justify-content: center;
  padding: 22px 28px 10px;
  background: transparent;
}

.brand-block {
  display: grid;
  justify-items: center;
  gap: 6px;
  text-align: center;
}

.logo-badge {
  position: relative;
  width: 120px;
  height: 120px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  overflow: hidden;
  padding: 0;
}

.logo-badge::before {
  display: none;
}

.logo-badge img {
  position: relative;
  z-index: 2;
  width: 82%;
  height: 82%;
  object-fit: contain;
  display: block;
  background: transparent;
  mix-blend-mode: multiply;
  -webkit-mask-image: none;
}

.brand-copy p {
  margin: 0;
  color: #0b1f3a;
  font-size: 26px;
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1.05;
}

.brand-copy p span {
  color: #23824a;
}

.brand-copy small {
  display: block;
  margin-top: 3px;
  color: #6c7687;
  font-size: 12px;
  font-weight: 700;
}

.login-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.88) 36%, rgba(255,255,255,0.82) 100%);
  padding: 14px 0 0;
}

.login-heading {
  margin: 0 30px 18px;
  text-align: center;
}

.login-heading h1 {
  margin: 0 0 7px;
  color: #071832;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 0;
}

.login-heading p {
  margin: 0;
  color: #6c7687;
  font-size: 13px;
}

.login-form {
  display: flex;
  flex-direction: column;
  padding: 0 30px;
}

.field-group {
  margin-bottom: 13px;
}

.field-group label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #071832;
  font-size: 12px;
  font-weight: 800;
}

.field-group label ion-icon {
  color: #23824a;
  font-size: 17px;
}

.input-shell {
  width: 100%;
  min-height: 47px;
  display: flex;
  align-items: center;
  overflow: hidden;
  box-sizing: border-box;
  border: 1px solid rgba(20,30,40,0.06);
  border-radius: 12px;
  background: rgba(255,255,255,0.92);
  box-shadow: 0 8px 20px rgba(3, 14, 28, 0.08);
  transition: border-color 140ms ease, box-shadow 140ms ease;
}

.input-shell:focus-within {
  border-color: #23824a;
  box-shadow: 0 0 0 3px rgba(35, 130, 74, 0.13);
}

.input-shell.invalid {
  border-color: #d92d20;
  box-shadow: 0 0 0 3px rgba(217, 45, 32, 0.12);
}

.login-form ion-input {
  width: 100%;
  flex: 1;
  --background: transparent;
  --color: #071832;
  --placeholder-color: #7a8798;
  --placeholder-opacity: 1;
  --padding-bottom: 0;
  --padding-end: 12px;
  --padding-start: 8px;
  --padding-top: 0;
  min-height: 45px;
  font-size: 13px;
}

.field-icon {
  flex: 0 0 auto;
  margin-left: 13px;
  color: #8c98a9;
  font-size: 19px;
}

.password-shell ion-input {
  --padding-end: 4px;
}

.password-toggle {
  width: 42px;
  height: 45px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border: 0;
  background: transparent;
  color: #7a8798;
  font-size: 19px;
}

.forgot-button {
  align-self: flex-end;
  display: block;
  margin: -3px 0 18px auto;
  border: 0;
  background: transparent;
  color: #23824a;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.2;
}

.login-button {
  --background: linear-gradient(135deg, #23824a 0%, #0f3f2a 100%);
  --background-activated: #0f3f2a;
  --background-focused: #0f3f2a;
  --background-hover: #0f3f2a;
  --border-radius: 10px;
  --box-shadow: 0 16px 30px rgba(15, 63, 42, 0.24);
  min-height: 49px;
  font-weight: 900;
  text-transform: none;
}

.login-button span {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.login-button ion-icon {
  font-size: 18px;
}

.form-error {
  margin: -9px 0 12px;
  color: #b42318;
  font-size: 12px;
  line-height: 1.35;
}

.role-section {
  margin: 18px 30px 22px;
}

.role-title {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 12px;
  align-items: center;
}

.role-title span {
  height: 1px;
  background: #dbe3ee;
}

.role-title p {
  margin: 0;
  color: #7a8798;
  font-size: 12px;
  font-weight: 800;
}

.role-selector {
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding: 4px;
  border: 1px solid #dce2ea;
  border-radius: 999px;
  background: #ffffff;
  box-shadow: 0 9px 24px rgba(15, 23, 42, 0.06);
}

.role-selector button {
  min-width: 0;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  flex: 1;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #5d6a7d;
  font-size: 11px;
  font-weight: 800;
  transition: background 140ms ease, color 140ms ease, box-shadow 140ms ease;
}

.role-selector button.active {
  background: #23824a;
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(35, 130, 74, 0.22);
}

.role-selector ion-icon {
  flex: 0 0 auto;
  font-size: 17px;
}

.role-hat-icon {
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.1;
}

.support-text {
  margin: auto 30px 30px;
  text-align: center;
  color: #8c98a9;
  font-size: 12px;
}

.support-text a {
  color: #23824a;
  font-weight: 800;
  text-decoration: none;
}

@media (max-width: 430px) {
  .login-shell {
    align-items: stretch;
    padding: 16px 12px;
    background:
      radial-gradient(circle at 18% 10%, rgba(132, 204, 22, 0.18), transparent 30%),
      radial-gradient(circle at 86% 8%, rgba(34, 197, 94, 0.16), transparent 32%),
      linear-gradient(155deg, #0f2f24 0%, #1f5a3d 45%, #dfeee4 100%);
  }

  .login-card {
    max-width: none;
    min-height: calc(100vh - 32px);
    border-radius: 28px;
    box-shadow: 0 24px 58px rgba(3, 14, 28, 0.26);
  }
}

@media (max-height: 760px) {
  .brand-hero {
    padding-top: 16px;
    padding-bottom: 8px;
  }

  .logo-badge,
  .logo-badge img {
    width: 124px;
    height: 96px;
  }

  .brand-copy p {
    font-size: 24px;
  }

  .login-panel {
    padding-top: 10px;
  }

  .login-heading {
    margin-bottom: 14px;
  }

  .role-section {
    margin-top: 16px;
    margin-bottom: 20px;
  }
}
</style>
