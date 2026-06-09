<template>
  <ion-page>
    <ion-content :fullscreen="true" class="login-page">
      <main class="login-shell">
        <section class="login-card">
          <div class="login-heading">
            <h1>Bienvenido de nuevo</h1>
            <p>Por favor, solicite sus credenciales</p>
          </div>

          <form class="login-form" @submit.prevent="handleLogin">
            <ion-list lines="none">
              <ion-item>
                <ion-label position="stacked">Correo o Usuario</ion-label>
                <ion-input
                  v-model="email"
                  autocomplete="email"
                  inputmode="email"
                  placeholder="solano@vet.cr"
                  type="email"
                />
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Contrasena</ion-label>
                <ion-input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="Ingrese su contrasena"
                />
                <ion-button
                  slot="end"
                  aria-label="Mostrar u ocultar contrasena"
                  fill="clear"
                  type="button"
                  @click="showPassword = !showPassword"
                >
                  <ion-icon :icon="showPassword ? eyeOffOutline : eyeOutline" />
                </ion-button>
              </ion-item>
            </ion-list>

            <button class="forgot-button" type="button">Has olvidado tu contrasena</button>

            <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

            <ion-button class="login-button" expand="block" type="submit" :disabled="isSubmitting">
              <ion-spinner v-if="isSubmitting" name="crescent" />
              <span v-else>Iniciar Sesion</span>
            </ion-button>
          </form>

          <div class="demo-users">
            <p>Usuarios demo</p>
            <button type="button" @click="fillDemo('admin@bovweight.cr')">Admin</button>
            <button type="button" @click="fillDemo('ivan@bovweight.cr')">Ganadero</button>
            <button type="button" @click="fillDemo('solano@vet.cr')">Veterinario</button>
          </div>

          <p class="support-text">No tienes una cuenta? <a href="#">Contactar a soporte</a></p>
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
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSpinner,
} from '@ionic/vue';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { getDefaultRouteForRole, login } from '@/modules/auth/services/sessionService';

const router = useRouter();
const email = ref('solano@vet.cr');
const password = ref('bovino1');
const showPassword = ref(false);
const errorMessage = ref('');
const isSubmitting = ref(false);

const fillDemo = (demoEmail: string) => {
  email.value = demoEmail;
  password.value = 'bovino1';
  errorMessage.value = '';
};

const validateForm = () => {
  if (!email.value.trim()) {
    return 'Ingrese su correo o usuario.';
  }

  if (!email.value.includes('@')) {
    return 'Ingrese un correo valido.';
  }

  if (password.value.length < 6) {
    return 'La contrasena debe tener al menos 6 caracteres.';
  }

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
    errorMessage.value = error instanceof Error ? error.message : 'No se pudo iniciar sesion.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.login-page {
  --background: #f8fafc;
}

.login-shell {
  min-height: 100%;
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: 46px 20px 24px;
}

.login-card {
  width: 100%;
  max-width: 390px;
  display: flex;
  flex-direction: column;
}

.login-heading {
  margin-top: 46px;
  margin-bottom: 24px;
}

.login-heading h1 {
  margin: 0 0 8px;
  color: #071832;
  font-size: 24px;
  font-weight: 800;
}

.login-heading p {
  margin: 0;
  color: #566071;
  font-size: 14px;
}

.login-form ion-list {
  background: transparent;
}

.login-form ion-item {
  --background: transparent;
  --border-color: transparent;
  --inner-padding-end: 0;
  --padding-start: 0;
  margin-bottom: 14px;
}

.login-form ion-input {
  --background: #ffffff;
  --border-color: #b8c0cc;
  --border-radius: 9px;
  --border-style: solid;
  --border-width: 1px;
  --color: #071832;
  --padding-bottom: 12px;
  --padding-end: 12px;
  --padding-start: 12px;
  --padding-top: 12px;
  margin-top: 8px;
  min-height: 44px;
}

.login-form ion-label {
  color: #071832;
  font-size: 13px;
}

.forgot-button {
  align-self: flex-end;
  display: block;
  margin: -6px 0 28px auto;
  border: 0;
  background: transparent;
  color: #566071;
  font-size: 12px;
}

.login-button {
  --background: #052b66;
  --border-radius: 7px;
  min-height: 44px;
  font-weight: 700;
}

.form-error {
  margin: -10px 0 14px;
  color: #b42318;
  font-size: 13px;
}

.demo-users {
  margin-top: 22px;
  padding-top: 16px;
  border-top: 1px solid #edf0f5;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.demo-users p {
  flex-basis: 100%;
  margin: 0 0 2px;
  color: #566071;
  font-size: 12px;
}

.demo-users button {
  border: 0;
  border-radius: 999px;
  background: #d8e7fb;
  color: #052b66;
  font-size: 12px;
  font-weight: 700;
  padding: 8px 12px;
}

.support-text {
  margin: auto 0 22px;
  text-align: center;
  color: #566071;
  font-size: 12px;
}

.support-text a {
  color: #2f75b5;
  font-weight: 700;
  text-decoration: none;
}
</style>
