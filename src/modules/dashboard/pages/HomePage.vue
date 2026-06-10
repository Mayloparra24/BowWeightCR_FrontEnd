<template>
  <ion-page>
    <ion-content :fullscreen="true" class="home-page">
      <main class="home-shell">
        <header class="home-header">
          <div>
            <p class="brand">BovWeightCR</p>
            <span>{{ headerSubtitle }}</span>
          </div>

          <div class="header-actions">
            <button type="button" aria-label="Notificaciones">
              <ion-icon :icon="notificationsOutline" />
            </button>
            <div v-if="!isAdmin" class="user-avatar">{{ userInitials }}</div>
            <router-link v-if="isAdmin" to="/app/configuracion" aria-label="Configuración">
              <ion-icon :icon="settingsOutline" />
            </router-link>
          </div>
        </header>

        <template v-if="isAdmin">
          <section class="metric-grid" aria-label="Resumen administrativo">
            <router-link class="metric-card users" to="/app/usuarios">
              <span>Usuarios</span>
              <strong>{{ adminStats.users }}</strong>
              <small>Registrados</small>
            </router-link>

            <router-link class="metric-card farms" to="/app/fincas">
              <span>Fincas</span>
              <strong>{{ adminStats.fincas }}</strong>
              <small>En sistema</small>
            </router-link>

            <router-link class="metric-card cattle" to="/app/bovinos">
              <span>Bovinos</span>
              <strong>{{ adminStats.bovinos }}</strong>
              <small>Activos</small>
            </router-link>

            <article class="metric-card estimates">
              <span>Estimaciones</span>
              <strong>{{ adminStats.estimates }}</strong>
              <small>Registradas</small>
            </article>
          </section>

          <section class="alerts-section">
            <h1>Alertas del sistema</h1>
            <p class="empty-state">Sin alertas registradas.</p>
          </section>

          <section class="events-section">
            <div class="section-heading">
              <h2>Últimos eventos</h2>
              <router-link to="/app/bitacora">Ver Bitácora</router-link>
            </div>
            <p class="empty-state dark">Sin eventos registrados.</p>
          </section>
        </template>

        <section v-else-if="isVet" class="vet-home">
          <p class="notice">Solo ves bovinos de las fincas que te han asignado.</p>

          <section class="vet-metrics" aria-label="Resumen veterinario">
            <router-link class="vet-card primary" to="/app/fincas">
              <strong>{{ vetStats.fincas }}</strong>
              <span>Fincas asignadas</span>
              <small>{{ assignedFarmNames }}</small>
            </router-link>

            <router-link class="vet-card secondary" to="/app/bovinos">
              <strong>{{ vetStats.bovinos }}</strong>
              <span>Bovinos asignados</span>
              <small>En fincas asignadas</small>
            </router-link>
          </section>

          <section class="activity-section">
            <div class="activity-heading">
              <h1>Actividad reciente</h1>
              <router-link to="/app/bovinos">Ver historial</router-link>
            </div>

            <div v-if="bovinosRecientes.length" class="animal-feed">
              <router-link
                v-for="bovino in bovinosRecientes"
                :key="bovino.id"
                class="animal-row"
                to="/app/bovinos"
              >
                <img :src="bovino.photoUrl" alt="" />
                <span>
                  <strong>{{ bovino.name }}</strong>
                  <small>Finca<br />{{ farmName(bovino.farmId) }}</small>
                </span>
                <b>{{ bovino.lastWeightKg }} <small>Kg</small></b>
              </router-link>
            </div>

            <p v-else class="empty-state">No hay actividad reciente.</p>
          </section>
        </section>

        <section v-else class="farmer-home">
          <router-link class="photo-card" to="/app/bovinos">
            <span>Nuevo cálculo</span>
            <strong>Tomar foto</strong>
            <small>Calcula el peso utilizando IA</small>
            <ion-icon :icon="cameraOutline" />
          </router-link>

          <div class="farmer-divider"></div>

          <section class="farmer-metrics" aria-label="Resumen ganadero">
            <router-link class="farmer-card inventory" to="/app/bovinos">
              <ion-icon :icon="cubeOutline" />
              <span>Inventario</span>
              <strong>{{ farmerStats.bovinos }}</strong>
              <small>Cabezas de ganado registradas</small>
            </router-link>

            <article class="farmer-card average">
              <ion-icon :icon="speedometerOutline" />
              <span>Promedio</span>
              <strong>{{ averageWeight }} <small>kg</small></strong>
              <small>Peso promedio en tus fincas</small>
            </article>
          </section>

          <section class="activity-section">
            <div class="activity-heading">
              <h1>Últimos pesajes</h1>
              <router-link to="/app/bovinos">Ver historial</router-link>
            </div>

            <div v-if="bovinosRecientes.length" class="animal-feed">
              <router-link
                v-for="bovino in bovinosRecientes"
                :key="bovino.id"
                class="animal-row"
                :to="`/app/bovinos/${bovino.id}`"
              >
                <img :src="bovino.photoUrl" alt="" />
                <span>
                  <strong>{{ bovino.name }}</strong>
                  <small>{{ bovino.lastWeightDate }}<br />{{ farmName(bovino.farmId) }}</small>
                </span>
                <b>{{ bovino.lastWeightKg }} <small>Kg</small></b>
              </router-link>
            </div>

            <p v-else class="empty-state">No hay pesajes registrados.</p>
          </section>
        </section>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import {
  cameraOutline,
  cubeOutline,
  notificationsOutline,
  settingsOutline,
  speedometerOutline,
} from 'ionicons/icons';
import { computed } from 'vue';
import { currentUser } from '@/modules/auth/services/sessionService';
import { bovinos, fincas } from '@/shared/data/mockData';

const userName = computed(() => currentUser.value?.fullName ?? 'Usuario');
const isAdmin = computed(() => currentUser.value?.role === 'admin');
const isVet = computed(() => currentUser.value?.role === 'veterinario');

const headerSubtitle = computed(() => {
  if (isAdmin.value) {
    return 'Panel de administrador';
  }

  if (isVet.value) {
    return `Bienvenido ${shortName.value}`;
  }

  return 'Panel ganadero';
});

const shortName = computed(() => {
  const parts = userName.value.split(' ').filter(Boolean);
  return parts.length > 1 ? `${parts[0]} ${parts.at(-1)}` : userName.value;
});

const userInitials = computed(() => {
  return userName.value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
});

const adminStats = computed(() => ({
  users: 0,
  fincas: 0,
  bovinos: 0,
  estimates: 0,
}));

const assignedFarmIds = computed(() => currentUser.value?.assignedFarmIds ?? []);
const fincasAsignadas = computed(() => fincas.filter((finca) => assignedFarmIds.value.includes(finca.id)));
const bovinosAsignados = computed(() => bovinos.filter((bovino) => assignedFarmIds.value.includes(bovino.farmId)));
const bovinosRecientes = computed(() => bovinosAsignados.value.slice(0, 2));

const vetStats = computed(() => ({
  fincas: fincasAsignadas.value.length,
  bovinos: bovinosAsignados.value.length,
}));

const farmerStats = computed(() => ({
  fincas: fincasAsignadas.value.length,
  bovinos: bovinosAsignados.value.length,
}));

const averageWeight = computed(() => {
  if (!bovinosAsignados.value.length) {
    return 0;
  }

  const total = bovinosAsignados.value.reduce((sum, bovino) => sum + bovino.lastWeightKg, 0);
  return Math.round(total / bovinosAsignados.value.length);
});

const assignedFarmNames = computed(() => {
  if (!fincasAsignadas.value.length) {
    return 'Sin fincas asignadas';
  }

  return fincasAsignadas.value.map((finca) => finca.name).join(' - ');
});

const farmName = (farmId: string) => {
  return fincas.find((finca) => finca.id === farmId)?.name ?? 'Sin finca';
};
</script>

<style scoped>
.home-page {
  --background: #f5f8fb;
}

.home-shell {
  width: 100%;
  min-height: 100%;
  padding: 28px 20px 104px;
  box-sizing: border-box;
  background:
    linear-gradient(180deg, rgba(245, 248, 251, 0.98), rgba(232, 239, 247, 0.92)),
    radial-gradient(circle at 16% 0%, rgba(139, 183, 229, 0.18), transparent 32%);
}

.home-page::part(scroll) {
  background:
    linear-gradient(180deg, rgba(245, 248, 251, 0.98), rgba(232, 239, 247, 0.92)),
    radial-gradient(circle at 16% 0%, rgba(139, 183, 229, 0.18), transparent 32%);
}

.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.brand {
  margin: 0;
  color: #08254a;
  font-size: 18px;
  font-weight: 900;
}

.home-header span {
  display: block;
  margin-top: 3px;
  color: #566071;
  font-size: 12px;
  font-weight: 700;
}

.header-actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.header-actions button,
.header-actions a {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(8, 37, 74, 0.08);
  border-radius: 10px;
  background: #ffffff;
  color: #08254a;
  box-shadow: 0 10px 22px rgba(8, 37, 74, 0.08);
}

.header-actions ion-icon {
  font-size: 20px;
}

.user-avatar {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #cfe0f5;
  color: #052b66;
  font-size: 12px;
  font-weight: 900;
  box-shadow: 0 10px 22px rgba(8, 37, 74, 0.08);
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 24px;
}

.metric-card {
  min-height: 108px;
  position: relative;
  display: grid;
  align-content: end;
  justify-items: start;
  padding: 16px;
  border-radius: 10px;
  color: #08254a;
  text-align: left;
  text-decoration: none;
  box-shadow: 0 16px 26px rgba(8, 37, 74, 0.1);
}

.metric-card span,
.metric-card small {
  font-size: 10px;
  font-weight: 800;
}

.metric-card span {
  position: absolute;
  top: 16px;
  right: 16px;
}

.metric-card strong {
  margin: 0 0 4px;
  font-size: 34px;
  font-weight: 900;
  line-height: 1;
}

.metric-card.users {
  background: #082b65;
  color: #ffffff;
}

.metric-card.users small,
.metric-card.users span {
  color: #cfe0f5;
}

.metric-card.farms {
  background: #5b8fc0;
  color: #052b66;
}

.metric-card.cattle {
  background: #8bb7e5;
  color: #052b66;
}

.metric-card.estimates {
  background: #d8e8f7;
  color: #052b66;
}

.alerts-section,
.events-section {
  margin-top: 26px;
}

.alerts-section h1,
.section-heading h2 {
  margin: 0;
  color: #08254a;
  font-size: 18px;
  font-weight: 900;
}

.empty-state {
  margin: 12px 0 0;
  padding: 16px;
  border: 1px dashed rgba(8, 37, 74, 0.18);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.7);
  color: #566071;
  font-size: 12px;
  font-weight: 800;
  text-align: center;
}

.empty-state.dark {
  background: #071832;
  border-color: rgba(207, 224, 245, 0.18);
  color: #cfe0f5;
  box-shadow: 0 16px 26px rgba(7, 24, 50, 0.2);
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-heading a {
  color: #2f75b5;
  font-size: 12px;
  font-weight: 800;
  text-decoration: none;
}

.vet-home {
  display: grid;
  gap: 16px;
  margin-top: 16px;
}

.notice {
  margin: 0;
  padding: 11px 12px;
  border-left: 4px solid #2f75b5;
  border-radius: 8px;
  background: #d8e8f7;
  color: #052b66;
  font-size: 11px;
  font-weight: 800;
  line-height: 1.35;
}

.vet-metrics {
  display: grid;
  gap: 16px;
  margin-top: 8px;
}

.vet-card {
  min-height: 112px;
  position: relative;
  display: grid;
  align-content: center;
  gap: 6px;
  padding: 18px;
  border-radius: 10px;
  color: #ffffff;
  text-decoration: none;
  box-shadow: 0 16px 26px rgba(8, 37, 74, 0.12);
}

.vet-card.primary {
  background: #052b66;
}

.vet-card.secondary {
  background: #5b8fc0;
  color: #052b66;
}

.vet-card strong {
  margin-top: 18px;
  font-size: 36px;
  line-height: 1;
}

.vet-card span {
  position: absolute;
  top: 18px;
  right: 18px;
  border-radius: 999px;
  padding: 6px 10px;
  background: #d8e8f7;
  color: #052b66;
  font-size: 10px;
  font-weight: 900;
}

.vet-card small {
  color: currentColor;
  font-size: 12px;
  line-height: 1.35;
}

.activity-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.activity-section h1 {
  margin: 0 0 4px;
  color: #08254a;
  font-size: 17px;
  font-weight: 900;
}

.activity-section a {
  color: #052b66;
  font-size: 11px;
  font-weight: 800;
  text-decoration: none;
  white-space: nowrap;
}

.animal-feed {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.animal-row {
  min-height: 64px;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  padding: 9px;
  border: 1px solid rgba(8, 37, 74, 0.08);
  border-radius: 10px;
  background: #ffffff;
  color: #071832;
  text-decoration: none;
  box-shadow: 0 12px 24px rgba(8, 37, 74, 0.08);
}

.animal-row img {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.animal-row strong {
  display: block;
  font-size: 13px;
  font-weight: 900;
}

.animal-row small {
  color: #2f75b5;
  font-size: 10px;
  font-weight: 800;
  line-height: 1.25;
}

.animal-row b {
  color: #052b66;
  font-size: 22px;
  font-weight: 900;
  white-space: nowrap;
}

.animal-row b small {
  color: #071832;
  font-size: 12px;
}

.farmer-home {
  display: grid;
  gap: 16px;
  margin-top: 16px;
}

.photo-card {
  min-height: 112px;
  position: relative;
  display: grid;
  align-content: center;
  gap: 6px;
  padding: 20px;
  border-radius: 10px;
  background: #052b66;
  color: #ffffff;
  text-decoration: none;
  box-shadow: 0 18px 30px rgba(8, 37, 74, 0.18);
}

.photo-card > span {
  width: max-content;
  border-radius: 999px;
  padding: 6px 12px;
  background: #d8e8f7;
  color: #052b66;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
}

.photo-card strong {
  font-size: 22px;
  font-weight: 900;
  text-transform: capitalize;
}

.photo-card small {
  color: #cfe0f5;
  font-size: 12px;
}

.photo-card ion-icon {
  position: absolute;
  right: 24px;
  top: 40px;
  color: #d8e8f7;
  font-size: 48px;
}

.farmer-divider {
  height: 2px;
  margin: 0 2px;
  background: #6e83a6;
}

.farmer-metrics {
  display: grid;
  gap: 16px;
}

.farmer-card {
  min-height: 112px;
  position: relative;
  display: grid;
  align-content: center;
  gap: 6px;
  padding: 18px;
  border-radius: 10px;
  color: #052b66;
  text-decoration: none;
  box-shadow: 0 16px 26px rgba(8, 37, 74, 0.12);
}

.farmer-card.inventory {
  background: #b7dff7;
}

.farmer-card.average {
  background: #5b8fc0;
}

.farmer-card ion-icon {
  position: absolute;
  left: 18px;
  top: 16px;
  font-size: 24px;
}

.farmer-card > span {
  justify-self: end;
  color: #052b66;
  font-size: 12px;
  font-weight: 900;
}

.farmer-card strong {
  margin-top: 12px;
  font-size: 34px;
  line-height: 1;
}

.farmer-card strong small {
  font-size: 13px;
}

.farmer-card small {
  color: #071832;
  font-size: 11px;
  line-height: 1.3;
}

.farmer-card.average,
.farmer-card.average > span,
.farmer-card.average small {
  color: #052b66;
}

@media (min-width: 700px) {
  .home-shell {
    max-width: 430px;
    min-height: auto;
    margin: 0 auto;
  }
}
</style>
