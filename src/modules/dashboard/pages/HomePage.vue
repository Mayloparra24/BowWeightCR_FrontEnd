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
            <button
              v-if="canManageReminders"
              type="button"
              aria-label="Recordatorios"
              class="notification-button"
              @click="abrirRecordatorios"
            >
              <ion-icon :icon="notificationsOutline" />
              <span v-if="notificationCount">{{ notificationCount }}</span>
            </button>
            <div v-if="!isAdmin" class="user-avatar">{{ userInitials }}</div>
            <router-link v-if="isAdmin" to="/app/configuracion" aria-label="Configuración">
              <ion-icon :icon="settingsOutline" />
            </router-link>
          </div>
        </header>

        <template v-if="isAdmin">
          <section class="metric-grid admin-grid" aria-label="Resumen administrativo">
            <router-link class="metric-card users" to="/app/usuarios">
              <span>Usuarios</span>
              <strong>{{ adminStats.users }}</strong>
              <small>Registrados</small>
            </router-link>
          </section>

          <section class="events-section">
            <div class="section-heading">
              <h2>Últimos eventos</h2>
              <router-link to="/app/bitacora">Ver Bitácora</router-link>
            </div>
            <div v-if="eventsError" class="event-list empty">
              <p>{{ eventsError }}</p>
            </div>
            <div v-else-if="adminEvents.length" class="event-list">
              <article v-for="event in adminEvents" :key="event.id">
                <span>{{ event.descripcion }}</span>
                <time>{{ event.creadaEl }}</time>
              </article>
            </div>
            <div v-else class="event-list empty">
              <p>No hay eventos recientes.</p>
            </div>
          </section>
        </template>

        <section v-else-if="isVet" class="vet-home">
          <p class="notice">Solo ves bovinos de las fincas que un ganadero o asistente te ha asignado.</p>

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
              <h1>Requieren atención</h1>
              <router-link to="/app/bovinos">Ver todos</router-link>
            </div>

            <div v-if="bovinosAtencion.length" class="animal-feed">
              <router-link
                v-for="item in bovinosAtencion"
                :key="item.bovino.id"
                class="animal-row attention"
                :to="`/app/bovinos/${item.bovino.id}`"
              >
                <img :src="bovinoPhoto(item.bovino.photoUrl)" alt="" @error="onBovinoPhotoError" />
                <span>
                  <strong>{{ item.bovino.name }}</strong>
                  <small>{{ farmName(item.bovino.farmId) }}<br />{{ item.reason }}</small>
                </span>
                <span class="attention-badge">{{ item.tone }}</span>
              </router-link>
            </div>

            <p v-else class="empty-state">No hay alertas veterinarias pendientes.</p>
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
                :to="`/app/bovinos/${bovino.id}`"
              >
                <img :src="bovinoPhoto(bovino.photoUrl)" alt="" @error="onBovinoPhotoError" />
                <span>
                  <strong>{{ bovino.name }}</strong>
                  <small>Finca<br />{{ farmName(bovino.farmId) }}</small>
                </span>
                <b v-if="bovino.lastWeightKg > 0">{{ bovino.lastWeightKg }} <small>Kg</small></b>
                <span v-else class="weight-empty">Sin pesaje</span>
              </router-link>
            </div>

            <p v-else class="empty-state">No hay actividad reciente.</p>
          </section>
        </section>

        <section v-else-if="isAssistant" class="vet-home">
          <p class="notice">Solo puedes capturar fotos y consultar animales de tus fincas asignadas.</p>

          <router-link class="photo-card" to="/app/calcular-peso">
            <span>Captura rápida</span>
            <strong>Tomar foto</strong>
            <small>Guarda pendiente si no hay conexión</small>
            <ion-icon :icon="cameraOutline" />
          </router-link>

          <section class="sync-section">
            <div>
              <strong>{{ pendingOfflineItems.length }} pendiente{{ pendingOfflineItems.length === 1 ? '' : 's' }}</strong>
              <span>{{ isOnline ? 'Conexión disponible' : 'Sin conexión' }}</span>
            </div>
            <button type="button" :disabled="!isOnline || !pendingOfflineItems.length" @click="markOfflineQueueSynced">
              Enviar
            </button>
          </section>

          <section class="activity-section">
            <div class="activity-heading">
              <h1>Buscar animal</h1>
              <router-link to="/app/bovinos">Abrir lista</router-link>
            </div>

            <div v-if="bovinosRecientes.length" class="animal-feed">
              <router-link
                v-for="bovino in bovinosRecientes"
                :key="bovino.id"
                class="animal-row"
                :to="`/app/bovinos/${bovino.id}`"
              >
                <img :src="bovinoPhoto(bovino.photoUrl)" alt="" @error="onBovinoPhotoError" />
                <span>
                  <strong>{{ bovino.name }}</strong>
                  <small>{{ bovino.earTag }}<br />{{ farmName(bovino.farmId) }}</small>
                </span>
                <b v-if="bovino.lastWeightKg > 0">{{ bovino.lastWeightKg }} <small>Kg</small></b>
                <span v-else class="weight-empty">Sin pesaje</span>
              </router-link>
            </div>
          </section>
        </section>

        <section v-else class="farmer-home">
          <router-link class="photo-card" to="/app/calcular-peso">
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

          <section v-if="pendingOfflineItems.length" class="sync-section">
            <div>
              <strong>{{ pendingOfflineItems.length }} pendiente{{ pendingOfflineItems.length === 1 ? '' : 's' }}</strong>
              <span>{{ isOnline ? 'Listo para sincronizar' : 'Guardado sin conexión' }}</span>
            </div>
            <button type="button" :disabled="!isOnline" @click="markOfflineQueueSynced">
              Sincronizar
            </button>
          </section>

          <section class="reminder-section">
            <div class="activity-heading">
              <h1>Recordatorios</h1>
              <router-link to="/app/recordatorios">Configurar</router-link>
            </div>

            <div v-if="reminders.length" class="reminder-list">
              <router-link
                v-for="reminder in reminders"
                :key="reminder.bovino.id"
                class="reminder-row"
                :to="`/app/bovinos/${reminder.bovino.id}`"
              >
                <span class="reminder-icon">
                  <ion-icon :icon="calendarOutline" />
                </span>
                <span>
                  <strong>{{ reminder.bovino.name }}</strong>
                  <small>{{ reminder.message }}</small>
                </span>
              </router-link>
            </div>

            <p v-else class="empty-state">No hay recordatorios de pesaje pendientes.</p>
          </section>

          <section class="activity-section">
            <div class="activity-heading">
              <h1>Últimos pesajes</h1>
              <router-link to="/app/bovinos">Ver historial</router-link>
            </div>

            <div v-if="ultimosPesajes.length" class="animal-feed">
              <router-link
                v-for="bovino in ultimosPesajes"
                :key="bovino.id"
                class="animal-row"
                :to="`/app/bovinos/${bovino.id}`"
              >
                <img :src="bovinoPhoto(bovino.photoUrl)" alt="" @error="onBovinoPhotoError" />
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
import { IonContent, IonIcon, IonPage, onIonViewWillEnter } from '@ionic/vue';
import {
  cameraOutline,
  calendarOutline,
  cubeOutline,
  notificationsOutline,
  settingsOutline,
  speedometerOutline,
} from 'ionicons/icons';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { currentUser } from '@/modules/auth/services/sessionService';
import { bitacoraRepo } from '@/shared/services/bitacoraRepo';
import { bovinosRepo } from '@/shared/services/bovinosRepo';
import { fincasRepo } from '@/shared/services/fincasRepo';
import { usuariosRepo } from '@/shared/services/usuariosRepo';
import { bovinoPhoto, onBovinoPhotoError } from '@/shared/utils/bovinoPhoto';
import {
  isOnline,
  markOfflineQueueSynced,
  pendingOfflineCount,
  pendingOfflineItems,
} from '@/shared/services/offlineService';
import {
  listarRecordatoriosVistos,
  marcarRecordatoriosVistos,
} from '@/shared/services/reminderService';
import type { BitacoraEvento, Bovino, Finca } from '@/shared/types/domain';

const router = useRouter();
const userName = computed(() => currentUser.value?.fullName ?? 'Usuario');
const isAdmin = computed(() => currentUser.value?.role === 'admin');
const isAssistant = computed(() => currentUser.value?.role === 'asistente');
const isVet = computed(() => currentUser.value?.role === 'veterinario');
const isFarmerDashboard = computed(() => !isAdmin.value && !isAssistant.value && !isVet.value);
const canManageReminders = computed(() => {
  const role = currentUser.value?.role;
  return role === 'ganadero' || isFarmerDashboard.value;
});

const fincas = ref<Finca[]>([]);
const bovinos = ref<Bovino[]>([]);
const totalUsuarios = ref(0);
const adminEvents = ref<BitacoraEvento[]>([]);
const eventsError = ref('');
const cargando = ref(true);
const viewedReminderStates = ref<Record<string, string>>({});

const cargarDatos = async () => {
  cargando.value = true;
  eventsError.value = '';
  try {
    if (!isAdmin.value) {
      const [f, b] = await Promise.all([fincasRepo.list(), bovinosRepo.list()]);
      fincas.value = f;
      bovinos.value = b;
      const vistos = await listarRecordatoriosVistos();
      viewedReminderStates.value = vistos;
    }
    if (isAdmin.value) {
      try {
        const { meta } = await usuariosRepo.list(1, 1);
        totalUsuarios.value = meta.total;
      } catch {
        totalUsuarios.value = 0;
      }
      try {
        const { items } = await bitacoraRepo.list({ perPage: 5 });
        adminEvents.value = items;
      } catch {
        adminEvents.value = [];
        eventsError.value = 'No se pudieron cargar los eventos.';
      }
    }
  } finally {
    cargando.value = false;
  }
};

onIonViewWillEnter(cargarDatos);

const headerSubtitle = computed(() => {
  if (isAdmin.value) return 'Panel de administrador';
  if (isAssistant.value) return 'Captura de campo';
  if (isVet.value) return `Bienvenido ${shortName.value}`;
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
  users: totalUsuarios.value,
  fincas: fincas.value.length,
  bovinos: bovinos.value.filter((bovino) => bovino.status === 'Activo').length,
  estimates: bovinos.value.filter((bovino) => bovino.lastWeightKg > 0).length,
}));

const bovinosRecientes = computed(() => bovinos.value.slice(0, 2));
const bovinosAtencion = computed(() => {
  return bovinos.value
    .map((bovino) => {
      if (bovino.lastWeightKg <= 0) {
        return { bovino, reason: 'Sin pesaje registrado', tone: 'Revisar' };
      }

      const days = daysSinceLastWeight(bovino.lastWeightDate);
      if (days >= 120) {
        return { bovino, reason: `Ultimo pesaje hace ${days} dias`, tone: 'Pendiente' };
      }

      const registros = [...(bovino.pesajes ?? [])].sort(
        (a, b) => parseRecordDate(b.date).getTime() - parseRecordDate(a.date).getTime(),
      );
      const [ultimo, anterior] = registros;
      if (ultimo && anterior) {
        const diferencia = ultimo.weightKg - anterior.weightKg;
        if (diferencia < 0) {
          return { bovino, reason: `Bajo ${Math.abs(diferencia)} kg desde el ultimo pesaje`, tone: 'Alerta' };
        }
        if (diferencia <= 5) {
          return { bovino, reason: `Crecimiento bajo: +${diferencia} kg`, tone: 'Observar' };
        }
      }

      return null;
    })
    .filter((item): item is { bovino: Bovino; reason: string; tone: string } => item !== null)
    .slice(0, 3);
});
const ultimosPesajes = computed(() => bovinos.value.filter((bovino) => bovino.lastWeightKg > 0).slice(0, 2));
const reminders = computed(() => {
  return bovinos.value
    .filter((bovino) => daysSinceLastWeight(bovino.lastWeightDate) >= 90 || bovino.lastWeightKg === 0)
    .slice(0, 3)
    .map((bovino) => {
      const days = daysSinceLastWeight(bovino.lastWeightDate);
      const message = bovino.lastWeightKg === 0
        ? 'Aún no tiene pesaje registrado.'
        : `Último pesaje hace ${days} días.`;
      return { bovino, message };
    });
});
const unreadReminderCount = computed(() => {
  return reminders.value.filter((reminder) => {
    return viewedReminderStates.value[reminder.bovino.id] !== reminderStateKey(reminder.bovino);
  }).length;
});
const notificationCount = computed(() => unreadReminderCount.value + pendingOfflineCount.value);

const abrirRecordatorios = async () => {
  const vistos = Object.fromEntries(
    reminders.value.map((reminder) => [reminder.bovino.id, reminderStateKey(reminder.bovino)]),
  );
  await marcarRecordatoriosVistos(vistos);
  viewedReminderStates.value = { ...viewedReminderStates.value, ...vistos };
  await router.push('/app/recordatorios');
};

const vetStats = computed(() => ({
  fincas: fincas.value.length,
  bovinos: bovinos.value.length,
}));

const farmerStats = computed(() => ({
  fincas: fincas.value.length,
  bovinos: bovinos.value.length,
}));

const averageWeight = computed(() => {
  const conPeso = bovinos.value.filter((bovino) => bovino.lastWeightKg > 0);
  if (!conPeso.length) return 0;
  const total = conPeso.reduce((sum, bovino) => sum + bovino.lastWeightKg, 0);
  return Math.round(total / conPeso.length);
});

const assignedFarmNames = computed(() => {
  if (!fincas.value.length) return 'Sin fincas asignadas';
  return fincas.value.map((finca) => finca.name).join(' - ');
});

const farmName = (farmId: string) => {
  return fincas.value.find((finca) => finca.id === farmId)?.name ?? 'Sin finca';
};

function daysSinceLastWeight(value: string) {
  if (!value) return 999;
  const [day, month, year] = value.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return 999;
  return Math.floor((Date.now() - date.getTime()) / 86_400_000);
}

function parseRecordDate(value: string) {
  const [day, month, year] = value.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

const reminderStateKey = (bovino: Bovino) => {
  return `${bovino.lastWeightDate || 'sin-fecha'}:${bovino.lastWeightKg}`;
};
</script>

<style scoped>
.home-page {
  --background: #f5f8fb;
}

.home-shell {
  width: 100%;
  min-height: 100%;
  padding: var(--bw-page-pad-top) var(--bw-page-pad-x) var(--bw-page-pad-bottom-tabs);
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
  position: relative;
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

.notification-button span {
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 18px;
  height: 18px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: #b42318;
  color: #ffffff;
  font-size: 10px;
  font-weight: 900;
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

.metric-grid.admin-grid {
  grid-template-columns: 1fr;
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

.admin-alert-list,
.event-list {
  display: grid;
  gap: 10px;
  margin-top: 12px;
}

.admin-alert-list p {
  margin: 0;
  padding: 12px;
  border-left: 4px solid #b42318;
  border-radius: 8px;
  background: #fff1f0;
  color: #7a271a;
  font-size: 12px;
  font-weight: 900;
}

.event-list {
  padding: 14px;
  border-radius: 8px;
  background: #071832;
  box-shadow: 0 16px 26px rgba(7, 24, 50, 0.2);
}

.event-list article {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  color: #dbe8f7;
  font-size: 11px;
  font-weight: 800;
}

.event-list time {
  color: #ffffff;
  font-weight: 900;
  white-space: nowrap;
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

.animal-row .weight-empty {
  max-width: 62px;
  color: #566071;
  font-size: 9px;
  font-weight: 900;
  line-height: 1.15;
  text-align: right;
  text-transform: uppercase;
}

.animal-row.attention {
  border-left: 4px solid #b42318;
}

.attention-badge {
  align-self: end;
  padding: 5px 8px;
  border-radius: 999px;
  background: #fff4d6;
  color: #7a4b00;
  font-size: 9px;
  font-weight: 900;
  text-transform: uppercase;
  white-space: nowrap;
}

.reminder-section {
  display: grid;
  gap: 12px;
}

.reminder-section .activity-heading {
  min-height: 28px;
}

.reminder-section h1 {
  margin: 0;
  color: #08254a;
  font-size: 17px;
  font-weight: 900;
}

.reminder-section a:not(.reminder-row) {
  color: #052b66;
  font-size: 11px;
  font-weight: 800;
  text-decoration: none;
  white-space: nowrap;
}

.sync-section {
  min-height: 58px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  background: #071832;
  color: #ffffff;
  box-shadow: 0 14px 24px rgba(8, 37, 74, 0.12);
}

.sync-section strong,
.sync-section span {
  display: block;
}

.sync-section strong {
  font-size: 13px;
  font-weight: 900;
}

.sync-section span {
  margin-top: 2px;
  color: #cfe0f5;
  font-size: 11px;
  font-weight: 800;
}

.sync-section button {
  min-height: 34px;
  padding: 0 12px;
  border: none;
  border-radius: 8px;
  background: #d8e8f7;
  color: #052b66;
  font-size: 11px;
  font-weight: 900;
}

.sync-section button:disabled {
  opacity: 0.5;
}

.reminder-list {
  display: grid;
  gap: 10px;
}

.reminder-row {
  min-height: 64px;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  padding: 9px 12px;
  border-left: 4px solid #2f75b5;
  border-radius: 8px;
  background: #ffffff;
  color: #071832;
  text-decoration: none;
  box-shadow: 0 12px 24px rgba(8, 37, 74, 0.08);
}

.reminder-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: #d8e8f7;
  color: #052b66;
}

.reminder-icon ion-icon {
  font-size: 24px;
}

.reminder-row strong,
.reminder-row small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
}

.reminder-row strong {
  font-size: 13px;
  font-weight: 900;
}

.reminder-row small {
  margin-top: 2px;
  color: #566071;
  font-size: 11px;
  font-weight: 800;
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
