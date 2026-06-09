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
                  <ion-icon :icon="shieldCheckmarkOutline" />
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
  shieldCheckmarkOutline,
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
  min-height: auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 20px;
  background: #dbe8dc;
  border: 1px solid rgba(211, 226, 199, 0.36);
  box-shadow: 0 30px 80px rgba(2,12,8,0.5);
}

.brand-hero {
  position: relative;
  display: flex;
  justify-content: center;
  padding: 26px 28px 20px;
  overflow: hidden;
  background:
    radial-gradient(circle at 18% 12%, rgba(242, 195, 107, 0.22), transparent 34%),
    linear-gradient(145deg, #0b2d22 0%, #185538 58%, #234f38 100%);
  border-bottom: 1px solid rgba(242, 195, 107, 0.22);
}

.brand-hero::after {
  content: '';
  position: absolute;
  inset: auto 34px 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(242, 195, 107, 0.7), transparent);
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
  background: linear-gradient(180deg, #f7f4e8 0%, #e7eadb 100%);
  border: 1px solid rgba(242, 195, 107, 0.34);
  box-shadow: 0 16px 34px rgba(3, 14, 28, 0.24);
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
  color: #f7f4e8;
  font-size: 28px;
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1;
}

.brand-copy p span {
  color: #f2c36b;
}

.brand-copy small {
  display: block;
  margin-top: 4px;
  color: #c9d9cd;
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
  background:
    linear-gradient(180deg, #e7efe5 0%, #dce8dc 48%, #d2e0d1 100%);
  padding: 34px 0 0;
}

.login-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url('/vaca.png') center 35% / cover no-repeat;
  filter: saturate(92%) contrast(104%) sepia(5%);
  opacity: 0.46;
  pointer-events: none;
  z-index: 0;
}

.login-panel::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(231, 239, 229, 0.5) 0%, rgba(220, 232, 220, 0.64) 45%, rgba(210, 224, 209, 0.78) 100%),
    linear-gradient(90deg, rgba(231, 239, 229, 0.32), rgba(231, 239, 229, 0.08), rgba(231, 239, 229, 0.32)),
    radial-gradient(circle at 50% 8%, rgba(242, 195, 107, 0.18), transparent 34%);
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
  color: #09251c;
  font-size: 12px;
  font-weight: 800;
}

.field-group label ion-icon {
  color: #1e7a48;
  font-size: 17px;
}

.input-shell {
  width: 100%;
  min-height: 47px;
  display: flex;
  align-items: center;
  overflow: hidden;
  box-sizing: border-box;
  border: 1px solid rgba(24, 85, 56, 0.13);
  border-radius: 12px;
  background: #f4f1e6;
  box-shadow: 0 8px 20px rgba(3, 14, 28, 0.07);
  transition: border-color 140ms ease, box-shadow 140ms ease;
}

.input-shell:focus-within {
  border-color: #1e7a48;
  box-shadow: 0 0 0 3px rgba(30, 122, 72, 0.14);
}

.input-shell.invalid {
  border-color: #d92d20;
  box-shadow: 0 0 0 3px rgba(217, 45, 32, 0.12);
}

.login-form ion-input {
  width: 100%;
  flex: 1;
  --background: transparent;
  --color: #09251c;
  --placeholder-color: #6e7d72;
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
  color: #738474;
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
  color: #66796c;
  font-size: 19px;
}

.forgot-button {
  align-self: flex-end;
  display: block;
  margin: -3px 0 16px auto;
  border: 0;
  background: transparent;
  color: #17643d;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.2;
}

.login-button {
  --background: linear-gradient(135deg, #1f7a47 0%, #0f3f2a 100%);
  --background-activated: #0f3f2a;
  --background-focused: #0f3f2a;
  --background-hover: #0f3f2a;
  --border-radius: 10px;
  --box-shadow: 0 16px 30px rgba(15, 63, 42, 0.26);
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
  color: #66796c;
  font-size: 12px;
}

.support-text a {
  color: #17643d;
  font-weight: 800;
  text-decoration: none;
}

@media (max-width: 430px) {
  .login-shell {
    align-items: stretch;
    padding: 16px 12px;
  }

  .login-card {
    max-width: none;
    min-height: auto;
    border-radius: 28px;
    box-shadow: 0 24px 58px rgba(3, 14, 28, 0.26);
  }
}

@media (max-height: 760px) {
  .brand-hero {
    padding-top: 18px;
    padding-bottom: 14px;
  }

  .logo-badge {
    width: 108px;
    height: 88px;
  }

  .brand-copy p {
    font-size: 25px;
  }

  .login-panel {
    padding-top: 24px;
  }
}
</style>
