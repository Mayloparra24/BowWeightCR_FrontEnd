<template>
  <ion-page>
    <ion-content class="page-surface">
      <section class="reminders-shell">
        <header class="page-header">
          <router-link class="back-button" to="/app/inicio" aria-label="Volver al inicio">
            <ion-icon :icon="chevronBackOutline" />
          </router-link>

          <div>
            <h1>Recordatorios de pesaje</h1>
            <p>Configura cada cuánto la app te avisa</p>
          </div>
        </header>

        <p v-if="!soportaNotificaciones" class="notice">
          Las notificaciones del teléfono solo funcionan en la app instalada en
          Android. Aquí puedes configurarlas, pero el aviso llegará desde el celular.
        </p>

        <p v-if="permisoDenegado" class="error-note">
          No se concedió permiso de notificaciones. Actívalo en los ajustes del
          teléfono para recibir los avisos.
        </p>

        <transition name="fade-note">
          <p v-if="mensajeOk" class="success-note">{{ mensajeOk }}</p>
        </transition>

        <div v-if="!bovinosDisponibles.length" class="empty-state">
          No tienes bovinos activos para configurar recordatorios.
        </div>

        <ul v-else class="reminder-cards">
          <li v-for="bovino in bovinosDisponibles" :key="bovino.id" class="reminder-card">
            <div class="card-head">
              <img :src="bovinoPhoto(bovino.photoUrl)" :alt="`Foto de ${bovino.name}`" @error="onBovinoPhotoError" />
              <div>
                <strong>{{ bovino.name }}</strong>
                <small>Arete {{ bovino.earTag }}</small>
              </div>
              <span v-if="config[bovino.id]" class="badge-active">Activo</span>
            </div>

            <label class="period-field">
              <span>Avísame cada</span>
              <select v-model.number="seleccion[bovino.id]">
                <option v-for="opcion in opcionesPeriodicidad" :key="opcion.dias" :value="opcion.dias">
                  {{ opcion.label }}
                </option>
              </select>
            </label>

            <p v-if="config[bovino.id]" class="next-info">
              Próximo aviso: {{ formatearFecha(config[bovino.id].proximoAviso) }}
            </p>

            <div class="card-actions">
              <button class="primary-button" type="button" @click="activar(bovino)">
                {{ config[bovino.id] ? 'Actualizar' : 'Activar recordatorio' }}
              </button>
              <button
                v-if="config[bovino.id]"
                class="ghost-button"
                type="button"
                @click="quitar(bovino)"
              >
                Quitar
              </button>
            </div>
          </li>
        </ul>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonPage, onIonViewWillEnter } from '@ionic/vue';
import { chevronBackOutline } from 'ionicons/icons';
import { computed, reactive, ref } from 'vue';
import { bovinosRepo } from '@/shared/services/bovinosRepo';
import type { Bovino } from '@/shared/types/domain';
import { bovinoPhoto, onBovinoPhotoError } from '@/shared/utils/bovinoPhoto';
import {
  cancelarRecordatorio,
  listarRecordatorios,
  programarRecordatorio,
  solicitarPermisoNotificaciones,
  type Recordatorio,
} from '@/shared/services/reminderService';
import { Capacitor } from '@capacitor/core';

const opcionesPeriodicidad = [
  { dias: 15, label: 'cada 15 días' },
  { dias: 30, label: 'cada mes' },
  { dias: 60, label: 'cada 2 meses' },
  { dias: 90, label: 'cada 3 meses' },
];

const soportaNotificaciones = Capacitor.isNativePlatform();

const config = reactive<Record<string, Recordatorio>>({});
const seleccion = reactive<Record<string, number>>({});
const permisoDenegado = ref(false);
const mensajeOk = ref('');

const bovinos = ref<Bovino[]>([]);
const bovinosDisponibles = computed(() => bovinos.value.filter((bovino) => bovino.status === 'Activo'));

const cargar = async () => {
  try {
    bovinos.value = await bovinosRepo.list();
  } catch {
    bovinos.value = [];
  }

  const lista = await listarRecordatorios();
  Object.keys(config).forEach((key) => delete config[key]);
  lista.forEach((item) => {
    config[item.bovinoId] = item;
  });

  bovinosDisponibles.value.forEach((bovino) => {
    if (!(bovino.id in seleccion)) {
      seleccion[bovino.id] = config[bovino.id]?.cadaDias ?? 30;
    }
  });
};

onIonViewWillEnter(cargar);

const activar = async (bovino: Bovino) => {
  permisoDenegado.value = false;
  mensajeOk.value = '';

  const concedido = await solicitarPermisoNotificaciones();

  if (soportaNotificaciones && !concedido) {
    permisoDenegado.value = true;
    return;
  }

  const cadaDias = seleccion[bovino.id] ?? 30;
  const recordatorio = await programarRecordatorio(bovino.id, bovino.name, cadaDias);
  config[bovino.id] = recordatorio;

  mensajeOk.value = soportaNotificaciones
    ? `Recordatorio activado para ${bovino.name}. Te avisaremos el ${formatearFecha(recordatorio.proximoAviso)}.`
    : `Recordatorio guardado para ${bovino.name}. El aviso del teléfono llegará desde la app instalada en Android.`;
};

const quitar = async (bovino: Bovino) => {
  await cancelarRecordatorio(bovino.id);
  delete config[bovino.id];
  mensajeOk.value = `Recordatorio de ${bovino.name} eliminado.`;
};

const formatearFecha = (iso: string) => {
  const fecha = new Date(iso);
  return fecha.toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
</script>

<style scoped>
.page-surface {
  --background: var(--bw-surface, #f5f8fb);
}

.page-surface::part(scroll) {
  display: flex;
  justify-content: center;
}

.reminders-shell {
  width: 100%;
  max-width: 430px;
  min-height: 100%;
  margin: 0 auto;
  padding: 22px 18px 104px;
  box-sizing: border-box;
}

.page-header {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 72px;
  text-align: center;
  margin-bottom: 8px;
}

.back-button {
  position: absolute;
  left: 0;
  top: 19px;
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  color: var(--bw-text, #071832);
}

.page-header h1 {
  margin: 0;
  color: var(--bw-text, #071832);
  font-size: 15px;
  font-weight: 900;
}

.page-header p {
  margin: 4px 0 0;
  color: var(--bw-text-secondary, #566071);
  font-size: 11px;
  font-weight: 800;
}

.notice {
  margin: 0 0 14px;
  padding: 11px 12px;
  border-left: 4px solid var(--bw-accent, #2f75b5);
  border-radius: 8px;
  background: var(--bw-chip, #d8e8f7);
  color: var(--bw-primary, #052b66);
  font-size: 11px;
  font-weight: 800;
  line-height: 1.35;
}

.error-note {
  margin: 0 0 14px;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(217, 45, 32, 0.1);
  color: var(--bw-error-text, #b42318);
  font-size: 11px;
  font-weight: 800;
}

.success-note {
  margin: 0 0 14px;
  padding: 11px 12px;
  border-left: 4px solid var(--bw-primary, #052b66);
  border-radius: 8px;
  background: var(--bw-chip, #d8e8f7);
  color: var(--bw-primary, #052b66);
  font-size: 11px;
  font-weight: 800;
  line-height: 1.35;
}

.fade-note-enter-active,
.fade-note-leave-active {
  transition: opacity 0.25s ease;
}

.fade-note-enter-from,
.fade-note-leave-to {
  opacity: 0;
}

.empty-state {
  padding: 22px 16px;
  border: 1px dashed rgba(8, 37, 74, 0.18);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.7);
  color: var(--bw-text-secondary, #566071);
  font-size: 12px;
  font-weight: 800;
  text-align: center;
}

.reminder-cards {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 14px;
}

.reminder-card {
  display: grid;
  gap: 12px;
  padding: 16px;
  border-radius: 10px;
  background: var(--bw-white, #ffffff);
  border: 1px solid rgba(8, 37, 74, 0.08);
  box-shadow: 0 12px 22px rgba(8, 37, 74, 0.08);
}

.card-head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-head img {
  width: 46px;
  height: 46px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}

.card-head strong {
  display: block;
  color: var(--bw-header, #08254a);
  font-size: 14px;
  font-weight: 900;
}

.card-head small {
  color: var(--bw-text-secondary, #566071);
  font-size: 11px;
  font-weight: 700;
}

.badge-active {
  margin-left: auto;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--bw-chip, #d8e8f7);
  color: var(--bw-primary, #052b66);
  font-size: 10px;
  font-weight: 900;
}

.period-field {
  display: grid;
  gap: 6px;
}

.period-field span {
  color: var(--bw-header, #08254a);
  font-size: 11px;
  font-weight: 900;
}

.period-field select {
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  box-sizing: border-box;
  border: 1px solid var(--bw-border, #e4e8ef);
  border-radius: 8px;
  background: var(--bw-white, #ffffff);
  color: var(--bw-text, #071832);
  font-size: 13px;
  font-weight: 700;
}

.next-info {
  margin: 0;
  color: var(--bw-accent, #2f75b5);
  font-size: 11px;
  font-weight: 800;
}

.card-actions {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;
}

.primary-button {
  min-height: 44px;
  border: none;
  border-radius: 999px;
  background: var(--bw-primary, #052b66);
  color: var(--bw-white, #ffffff);
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
}

.ghost-button {
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid rgba(217, 45, 32, 0.4);
  border-radius: 999px;
  background: var(--bw-white, #ffffff);
  color: var(--bw-error-text, #b42318);
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
}
</style>
