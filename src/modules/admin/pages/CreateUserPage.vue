<template>
  <ion-page>
    <ion-content class="page-surface">
      <section class="content">
        <header class="page-header">
          <router-link v-if="currentStep !== 'success'" class="back-button" to="/app/usuarios" aria-label="Volver a usuarios">
            <ion-icon :icon="chevronBackOutline" />
          </router-link>

          <div>
            <h1>Crear usuario</h1>
            <p>{{ headerSubtitle }}</p>
          </div>
        </header>

        <form v-if="currentStep === 'details'" class="form" @submit.prevent="goToFarms">
          <section>
            <h2>Rol del usuario</h2>
            <div class="role-selector">
              <button
                v-for="option in roles"
                :key="option.value"
                :class="{ active: selectedRole === option.value }"
                type="button"
                @click="selectedRole = option.value"
              >
                <ion-icon :icon="option.icon" />
                {{ option.label }}
              </button>
            </div>
          </section>

          <div class="divider"></div>

          <label>
            <span>Nombre completo</span>
            <input v-model="fullName" type="text" placeholder="Ej. Roberto Solano" autocomplete="name" />
          </label>

          <label>
            <span>Correo electrónico</span>
            <input v-model="email" type="email" placeholder="usuario@bovweight.cr" autocomplete="email" />
          </label>

          <label>
            <span>Contraseña temporal</span>
            <div class="password-field">
              <input v-model="temporaryPassword" :type="showPassword ? 'text' : 'password'" readonly />
              <button type="button" aria-label="Mostrar contraseña" @click="showPassword = !showPassword">
                <ion-icon :icon="eyeOutline" />
              </button>
            </div>
          </label>

          <div class="password-actions">
            <button type="button" @click="temporaryPassword = generateTemporaryPassword()">
              <ion-icon :icon="refreshOutline" />
              Generar otra
            </button>
            <button type="button" @click="copyTemporaryPassword">
              <ion-icon :icon="copyOutline" />
              Copiar
            </button>
          </div>

          <p class="notice">La contraseña se genera automáticamente y deberá cambiarse en el primer inicio de sesión.</p>

          <div class="actions">
            <router-link class="cancel-button" to="/app/usuarios">Cancelar</router-link>
            <button class="next-button" type="submit" :disabled="!canContinueDetails">
              Siguiente
              <ion-icon :icon="arrowForwardOutline" />
            </button>
          </div>
        </form>

        <section v-else-if="currentStep === 'fincas'" class="farms-step">
          <section class="user-summary">
            <div class="summary-avatar">
              <ion-icon :icon="personOutline" />
            </div>
            <div>
              <h2>{{ cleanFullName }}</h2>
              <p>{{ cleanEmail }}</p>
              <span>{{ roleLabel }}</span>
            </div>
          </section>

          <h2>Fincas a asignar</h2>
          <p class="notice compact">
            El usuario solo podrá ver bovinos de las fincas que selecciones aquí.
          </p>

          <div v-if="availableFarms.length" class="farm-list">
            <button
              v-for="farm in availableFarms"
              :key="farm.id"
              :class="{ selected: selectedFarmIds.includes(farm.id) }"
              type="button"
              @click="toggleFarm(farm.id)"
            >
              <span class="check-box">
                <ion-icon v-if="selectedFarmIds.includes(farm.id)" :icon="checkmarkOutline" />
              </span>
              <span>
                <strong>{{ farm.name }}</strong>
                <small>{{ farm.location }} - {{ farm.cattleCount }} cabezas</small>
              </span>
            </button>
          </div>

          <div v-else class="empty-panel">
            <strong>No hay fincas registradas.</strong>
            <span>Podrás asignarlas cuando existan fincas creadas en el sistema.</span>
          </div>

          <div class="selected-row">
            <strong>Seleccionadas:</strong>
            <span v-if="selectedFarmIds.length">{{ selectedFarmIds.length }}</span>
            <span v-else>Ninguna</span>
          </div>

          <div class="actions">
            <button class="cancel-button" type="button" @click="currentStep = 'details'">Atrás</button>
            <button class="next-button" type="button" @click="createUser">Crear usuario</button>
          </div>
        </section>

        <section v-else class="success-step">
          <div class="success-icon">
            <ion-icon :icon="personOutline" />
          </div>
          <h2>Usuario creado</h2>
          
          <p v-if="selectedRole === 'veterinario' || selectedRole === 'asistente'">
          Se preparó la cuenta de {{ cleanFullName }} con acceso a {{ selectedFarmIds.length }}
          {{ selectedFarmIds.length === 1 ? 'finca' : 'fincas' }}.
          </p>
          <p v-else>
          Se preparó la cuenta de {{ cleanFullName }} con el rol de {{ roleLabel }} listo para operar.
          </p>

          <section class="account-card">
            <header>
              <ion-icon :icon="idCardOutline" />
              <strong>Resumen de la cuenta</strong>
            </header>
            <dl>
              <div>
                <dt>Nombre</dt>
                <dd>{{ cleanFullName }}</dd>
              </div>
              <div>
                <dt>Correo</dt>
                <dd>{{ cleanEmail }}</dd>
              </div>
              <div>
                <dt>Rol</dt>
                <dd>
                  <span>{{ roleLabel }}</span>
                </dd>
              </div>
              <div v-if="selectedRole === 'veterinario' || selectedRole === 'asistente'">
                <dt>Fincas</dt>
                <dd>{{ selectedFarmIds.length }} asignadas</dd>
              </div>
              <div>
                <dt>Estado</dt>
                <dd>
                  <span class="active-pill">Activo</span>
                </dd>
              </div>
            </dl>
          </section>

          <p class="notice compact">Comparte la contraseña temporal por un canal seguro.</p>

          <router-link class="return-button" to="/app/usuarios">Volver a usuarios</router-link>
        </section>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonPage, onIonViewWillLeave, onIonViewWillEnter } from '@ionic/vue';
import {
  arrowForwardOutline,
  checkmarkOutline,
  chevronBackOutline,
  copyOutline,
  eyeOutline,
  idCardOutline,
  personOutline,
  pulseOutline,
  refreshOutline,
} from 'ionicons/icons';
import { computed, ref } from 'vue';
import type { Finca, Rol } from '@/shared/types/domain';

type CreateStep = 'details' | 'fincas' | 'success';

// 1. Definimos el SVG del ganadero en formato de datos (Data URI)
const ganaderoIcon = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 8 8"><path fill="currentColor" d="M0 3q4 2 8 0L6 5Q4 6 2 5m2-3q2-3 2 1q-2 1-4 0q0-4 2-1"/></svg>';

// 2. Pasamos el icono al arreglo de roles
const roles: Array<{ label: string; value: Exclude<Rol, 'admin'>; icon: string }> = [
  { label: 'Ganadero', value: 'ganadero', icon: ganaderoIcon }, // <-- Ahora usa el nuevo SVG
  { label: 'Asistente', value: 'asistente', icon: idCardOutline },
  { label: 'Veterinario', value: 'veterinario', icon: pulseOutline },
];

const availableFarms: Finca[] = [];

const currentStep = ref<CreateStep>('details');
const selectedRole = ref<Exclude<Rol, 'admin'>>('veterinario');
const fullName = ref('');
const email = ref('');
const temporaryPassword = ref(generateTemporaryPassword());
const showPassword = ref(false);
const selectedFarmIds = ref<string[]>([]);

const cleanFullName = computed(() => fullName.value.trim());
const cleanEmail = computed(() => email.value.trim().toLowerCase());
const roleLabel = computed(() => {
  const option = roles.find((item) => item.value === selectedRole.value);
  return option?.label ?? 'Usuario';
});

onIonViewWillEnter(() => {
  resetForm();
  const tabBar = document.querySelector('ion-tab-bar');
  if (tabBar) tabBar.style.display = 'none';
});

onIonViewWillLeave(() => {
  const tabBar = document.querySelector('ion-tab-bar');
  if (tabBar) tabBar.style.display = 'flex';
});

function resetForm() {
  currentStep.value = 'details';
  selectedRole.value = 'veterinario';
  fullName.value = '';
  email.value = '';
  temporaryPassword.value = generateTemporaryPassword();
  showPassword.value = false;
  selectedFarmIds.value = [];
}
const headerSubtitle = computed(() => {
  if (currentStep.value === 'fincas') {
    return 'Paso 2 de 2 - Asignar fincas';
  }

  if (currentStep.value === 'success') {
    return 'Usuario creado exitosamente';
  }

  return 'Paso 1 de 2 - Datos básicos';
});

const canContinueDetails = computed(() => {
  return cleanFullName.value.length >= 3 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail.value);
});

function generateTemporaryPassword() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!$%*';
  const pick = (source: string) => source[Math.floor(Math.random() * source.length)];

  return [
    pick(letters),
    pick(letters),
    pick(numbers),
    pick(letters),
    pick(symbols),
    pick(numbers),
    pick(letters),
    pick(letters),
  ].join('');
}

async function copyTemporaryPassword() {
  await navigator.clipboard?.writeText(temporaryPassword.value);
}

function goToFarms() {
  if (!canContinueDetails.value) return;

  if (selectedRole.value === 'ganadero') {
    createUser(); 
  } else {
    currentStep.value = 'fincas';
  }
}

function toggleFarm(farmId: string) {
  if (selectedFarmIds.value.includes(farmId)) {
    selectedFarmIds.value = selectedFarmIds.value.filter((id) => id !== farmId);
    return;
  }

  selectedFarmIds.value = [...selectedFarmIds.value, farmId];
}

function createUser() {
  currentStep.value = 'success';
}

onIonViewWillLeave(() => {
  currentStep.value = 'details';
  selectedRole.value = 'veterinario';
  fullName.value = '';
  email.value = '';
  temporaryPassword.value = generateTemporaryPassword();
  showPassword.value = false;
  selectedFarmIds.value = [];
});
</script>

<style scoped>
.page-surface {
  --background: #ffffff;
}

.content {
  width: 100%;
  max-width: 390px;
  min-height: 100%;
  margin: 0 auto;
  padding: 22px 18px 28px;
  box-sizing: border-box;
}

.page-header {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 64px;
  border-bottom: 1px solid #e4e8ef;
  text-align: center;
}

.back-button {
  position: absolute;
  left: 0;
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  color: #071832;
}

h1 {
  margin: 0;
  color: #071832;
  font-size: 15px;
  font-weight: 900;
}

.page-header p {
  margin: 3px 0 0;
  color: #566071;
  font-size: 10px;
  font-weight: 800;
}

.form,
.farms-step,
.success-step {
  display: grid;
  gap: 16px;
  padding-top: 30px;
}

h2 {
  margin: 0;
  color: #052b66;
  font-size: 15px;
  font-weight: 900;
}

.form section h2 {
  margin-bottom: 14px;
}

.role-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.role-selector button {
  min-height: 62px;
  display: grid;
  place-items: center;
  gap: 5px;
  border: 0;
  border-radius: 8px;
  background: #b7dff7;
  color: #052b66;
  font-size: 11px;
  font-weight: 900;
}

.role-selector ion-icon {
  font-size: 22px;
}

.role-selector .active {
  background: #052b66;
  color: #ffffff;
}

.divider {
  height: 1px;
  margin: 6px 0 4px;
  background: #6e83a6;
}

label {
  display: grid;
  gap: 7px;
  color: #071832;
  font-size: 11px;
  font-weight: 900;
}

input {
  width: 100%;
  min-height: 44px;
  border: 1px solid #a8b5c7;
  border-radius: 4px;
  padding: 0 12px;
  background: #f5f6f8;
  color: #071832;
  font-size: 13px;
  box-sizing: border-box;
}

input::placeholder {
  color: #7a8798;
}

.password-field {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 44px;
  border: 1px solid #a8b5c7;
  border-radius: 4px;
  background: #f5f6f8;
}

.password-field input {
  border: 0;
  background: transparent;
}

.password-field button {
  border: 0;
  background: transparent;
  color: #071832;
  font-size: 19px;
}

.password-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: -8px;
}

.password-actions button {
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: 0;
  border-radius: 8px;
  background: #d8e8f7;
  color: #052b66;
  font-size: 11px;
  font-weight: 900;
  line-height: 1;
  white-space: nowrap;
}

.password-actions ion-icon {
  flex: 0 0 auto;
  font-size: 16px;
}

.notice {
  margin: 2px 0 26px;
  padding: 10px 12px;
  background: #fff08a;
  color: #74601d;
  font-size: 10px;
  font-weight: 800;
  line-height: 1.35;
  text-align: center;
}

.notice.compact {
  margin: 0;
}

.actions {
  display: flex;
  justify-content: center; /* Cambiado de flex-end a center */
  align-items: center;
  gap: 16px;
  width: 100%;
  margin-top: 10px;
}

.cancel-button,
.next-button,
.return-button {
  min-width: 86px;
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 0;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 900;
  text-decoration: none;
}

.cancel-button {
  background: #a8acb8;
  color: #052b66;
}

.next-button,
.return-button {
  background: #052b66;
  color: #ffffff;
}

.next-button:disabled {
  opacity: 0.45;
}

.user-summary {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  margin: -30px -18px 10px;
  padding: 18px;
  background: #d9d9d9;
}

.summary-avatar,
.success-icon {
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #052b66;
  color: #ffffff;
}

.summary-avatar {
  width: 48px;
  height: 48px;
}

.summary-avatar ion-icon,
.success-icon ion-icon {
  font-size: 30px;
}

.user-summary h2 {
  color: #071832;
}

.user-summary p {
  margin: 2px 0 6px;
  color: #052b66;
  font-size: 11px;
  font-weight: 800;
}

.user-summary span,
.account-card dd span,
.active-pill {
  display: inline-flex;
  border-radius: 999px;
  padding: 5px 10px;
  background: #b7d8f0;
  color: #052b66;
  font-size: 10px;
  font-weight: 900;
}

.farm-list {
  display: grid;
  gap: 10px;
}

.farm-list button {
  min-height: 62px;
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  border: 0;
  border-radius: 8px;
  padding: 11px;
  background: #b8bcc6;
  color: #071832;
  text-align: left;
}

.farm-list button.selected {
  background: #052b66;
  color: #ffffff;
}

.check-box {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 7px;
  background: #d8e8f7;
  color: #052b66;
}

.farm-list strong,
.farm-list small {
  display: block;
}

.farm-list strong {
  font-size: 12px;
  font-weight: 900;
}

.farm-list small {
  margin-top: 4px;
  font-size: 10px;
}

.empty-panel {
  min-height: 134px;
  display: grid;
  place-items: center;
  gap: 8px;
  padding: 20px;
  border: 1px dashed #a8b5c7;
  border-radius: 8px;
  background: #f5f8fb;
  color: #566071;
  text-align: center;
}

.empty-panel strong {
  color: #071832;
  font-size: 13px;
}

.empty-panel span {
  max-width: 240px;
  font-size: 11px;
  line-height: 1.35;
}

.selected-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #052b66;
  font-size: 11px;
  font-weight: 900;
}

.selected-row span {
  border-radius: 999px;
  padding: 5px 10px;
  background: #d8e8f7;
}

.success-step {
  justify-items: center;
  text-align: center;
}

.success-icon {
  width: 62px;
  height: 62px;
}

.success-step > p {
  max-width: 260px;
  margin: -8px 0 18px;
  color: #052b66;
  font-size: 12px;
  line-height: 1.35;
}

.account-card {
  width: 100%;
  display: grid;
  gap: 14px;
  padding: 18px;
  border-radius: 8px;
  background: #052b66;
  color: #ffffff;
  text-align: left;
  box-sizing: border-box;
}

.account-card header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 900;
}

.account-card header ion-icon {
  font-size: 24px;
}

dl {
  display: grid;
  gap: 13px;
  margin: 0;
}

dl div {
  display: grid;
  grid-template-columns: 82px minmax(0, 1fr);
  gap: 12px;
}

dt {
  color: #ffffff;
  font-size: 11px;
  font-weight: 900;
}

dd {
  margin: 0;
  color: #dbe8f7;
  font-size: 11px;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.active-pill {
  background: #d8e8f7;
  color: #052b66;
}

.return-button {
  margin-top: 4px;
  padding: 0 18px;
}
</style>
