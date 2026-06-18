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

              <button class="forgot-button" type="button">¿Olvidaste tu contraseña?</button>

              <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>

              <ion-button class="login-button" expand="block" type="submit" :disabled="isSubmitting">
                <ion-spinner v-if="isSubmitting" name="crescent" />
                <span v-else>
                  Iniciar sesión
                </span>
              </ion-button>
            </form>

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
  --background: linear-gradient(180deg, #062b66 0%, #071832 100%);
  position: relative;
  min-height: 100vh;
}

.login-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 14% 8%, rgba(139, 183, 229, 0.18), transparent 30%),
    linear-gradient(180deg, rgba(5, 43, 102, 0.24), rgba(7, 24, 50, 0.42));
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
  min-height: auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid rgba(139, 183, 229, 0.36);
  box-shadow: 0 30px 80px rgba(2, 14, 32, 0.42);
}

.brand-hero {
  position: relative;
  display: flex;
  justify-content: center;
  padding: 26px 28px 20px;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 0%, rgba(139, 183, 229, 0.26), transparent 42%),
    linear-gradient(180deg, #062b66 0%, #071832 100%);
  border-bottom: 1px solid rgba(139, 183, 229, 0.2);
}

.brand-hero::after {
  content: '';
  position: absolute;
  inset: auto 34px 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(139, 183, 229, 0.48), transparent);
}

.brand-block {
  display: grid;
  justify-items: center;
  gap: 9px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.logo-badge {
  position: relative;
  width: 118px;
  height: 98px;
  display: grid;
  place-items: center;
  border-radius: 30px;
  overflow: hidden;
  padding: 7px 10px;
  background: #fffaf0;
  border: 1px solid rgba(8, 37, 74, 0.08);
  box-shadow: 0 16px 34px rgba(8, 37, 74, 0.12);
}

.logo-badge::before {
  display: none;
}

.logo-badge img {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  background: transparent;
  mix-blend-mode: multiply;
  -webkit-mask-image: none;
}

.brand-copy p {
  margin: 0;
  color: #ffffff;
  font-size: 28px;
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1;
}

.brand-copy p span {
  color: #2f75b5;
}

.brand-copy small {
  display: block;
  margin-top: 4px;
  color: #cfe0f5;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.2;
}

.login-panel {
  position: relative;
  flex: 0 1 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #ffffff;
  padding: 34px 0 0;
}

.login-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url('/vaca.png') center 35% / cover no-repeat;
  filter: saturate(92%) contrast(108%) sepia(4%);
  opacity: 0.48;
  pointer-events: none;
  z-index: 0;
}

.login-panel::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.62) 0%, rgba(255, 255, 255, 0.56) 48%, rgba(255, 255, 255, 0.72) 100%),
    linear-gradient(90deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.22));
  pointer-events: none;
  z-index: 0;
}

.login-panel > * {
  position: relative;
  z-index: 1;
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
  color: #052b66;
  font-size: 17px;
}

.input-shell {
  width: 100%;
  min-height: 47px;
  display: flex;
  align-items: center;
  overflow: hidden;
  box-sizing: border-box;
  border: 1px solid #a8acb8;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(7, 24, 50, 0.06);
  transition: border-color 140ms ease, box-shadow 140ms ease;
}

.input-shell:focus-within {
  border-color: #052b66;
  box-shadow: 0 0 0 3px rgba(5, 43, 102, 0.12);
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
  --placeholder-color: #566071;
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
  color: #6f7a8a;
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
  color: #071832;
  font-size: 19px;
}

.forgot-button {
  align-self: flex-end;
  display: block;
  margin: -3px 0 16px auto;
  border: 0;
  background: transparent;
  color: #071832;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.2;
}

.login-button {
  --background: #052b66;
  --background-activated: #071832;
  --background-focused: #071832;
  --background-hover: #071832;
  --border-radius: 10px;
  --box-shadow: 0 16px 30px rgba(5, 43, 102, 0.18);
  min-height: 49px;
  margin-top: 4px;
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

.support-text {
  margin: 24px 30px 28px;
  text-align: center;
  color: #566071;
  font-size: 12px;
}

.support-text a {
  color: #2f75b5;
  font-weight: 800;
  text-decoration: none;
}

@media (max-width: 430px) {
  .login-shell {
    align-items: stretch;
    min-height: auto;
    padding: 10px 10px 14px;
  }

  .login-card {
    max-width: none;
    min-height: auto;
    border-radius: 22px;
    box-shadow: 0 24px 58px rgba(3, 14, 28, 0.26);
  }

  .brand-hero {
    padding: 16px 18px 12px;
  }

  .brand-block {
    gap: 7px;
  }

  .logo-badge {
    width: 86px;
    height: 72px;
    border-radius: 22px;
    padding: 5px 8px;
  }

  .brand-copy p {
    font-size: 22px;
  }

  .brand-copy small {
    margin-top: 3px;
    font-size: 11px;
  }

  .login-panel {
    padding-top: 18px;
  }

  .login-panel::before {
    background-position: center 28%;
    opacity: 0.42;
  }

  .login-form {
    padding: 0 24px;
  }

  .field-group {
    margin-bottom: 10px;
  }

  .field-group label {
    margin-bottom: 6px;
    font-size: 11px;
  }

  .input-shell {
    min-height: 42px;
    border-radius: 10px;
  }

  .login-form ion-input {
    min-height: 40px;
    font-size: 12px;
  }

  .field-icon {
    margin-left: 12px;
    font-size: 17px;
  }

  .password-toggle {
    width: 38px;
    height: 40px;
  }

  .forgot-button {
    margin: -2px 0 12px auto;
    font-size: 11px;
  }

  .login-button {
    min-height: 43px;
  }

  .support-text {
    margin: 18px 24px 20px;
    font-size: 11px;
  }
}

@media (max-height: 760px) {
  .brand-hero {
    padding-top: 14px;
    padding-bottom: 10px;
  }

  .logo-badge {
    width: 82px;
    height: 68px;
  }

  .brand-copy p {
    font-size: 21px;
  }

  .login-panel {
    padding-top: 16px;
  }
}
</style>
