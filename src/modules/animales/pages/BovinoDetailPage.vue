<template>
  <ion-page>
    <ion-content class="page-surface">
      <section class="detail-shell">
        <header class="page-header">
          <router-link class="back-button" to="/app/bovinos" aria-label="Volver a bovinos">
            <ion-icon :icon="chevronBackOutline" />
          </router-link>

          <h1>Perfil del bovino</h1>
        </header>

        <template v-if="bovino">
          <section class="profile-card">
            <img :src="bovinoPhoto(bovino.photoUrl)" :alt="`Foto de ${bovino.name}`" @error="onBovinoPhotoError" />
            <div>
              <h2>{{ bovino.name }}</h2>
              <p>{{ bovino.breed }} - {{ bovino.sex }} - Arete</p>
              <small>{{ bovino.earTag }}</small>
            </div>
            <span>{{ bovino.status }}</span>
          </section>

          <button v-if="canManageStatus" type="button" class="edit-button" @click="abrirEdicion">
            <ion-icon :icon="createOutline" />
            Editar información
          </button>

          <section v-if="canManageStatus" class="status-section">
            <h2>Estado del animal</h2>
            <div class="status-actions">
              <button
                v-if="bovino.status === 'Activo'"
                type="button"
                class="active"
                @click="abrirInactivacion"
              >
                Marcar inactivo
              </button>
              <button
                v-else
                type="button"
                class="active"
                @click="reactivar"
              >
                Reactivar
              </button>
            </div>
            <p v-if="bovino.motivoInactividad" class="readonly-note">
              Motivo de inactividad: {{ bovino.motivoInactividad }}
            </p>
          </section>

          <section class="chart-section">
            <h2>
              <ion-icon :icon="analyticsOutline" />
              Evolución de peso
            </h2>
            <p class="trend-pill" :class="trendTone">{{ trendLabel }}</p>
            <div v-if="orderedRecords.length" class="weight-chart" aria-label="Gráfico de evolución de peso">
              <div
                v-for="record in orderedRecords"
                :key="record.id"
                class="chart-point"
              >
                <span>{{ record.weightKg }}</span>
                <b :style="{ height: `${barHeight(record.weightKg)}%` }"></b>
                <small>{{ shortDate(record.date) }}</small>
              </div>
            </div>
            <p v-else class="empty-note">No hay datos suficientes para graficar.</p>
          </section>

          <section class="history-section">
            <div class="section-title">
              <h2>Historial de pesos</h2>
              <div class="report-actions">
                <button type="button" aria-label="Exportar CSV" @click="exportarCsv">
                  <ion-icon :icon="downloadOutline" />
                </button>
                <button type="button" aria-label="Generar PDF" @click="generarPdf">
                  <ion-icon :icon="documentTextOutline" />
                </button>
                <button type="button" aria-label="Compartir reporte" @click="compartirReporte">
                  <ion-icon :icon="shareSocialOutline" />
                </button>
              </div>
            </div>
            <div v-if="orderedRecords.length" class="history-panel">
              <div class="table-head">
                <span>Fecha</span>
                <span>Peso</span>
                <span>Tipo</span>
              </div>

              <article v-for="record in orderedRecords" :key="record.id">
                <time>{{ record.date }}</time>
                <strong>{{ record.weightKg }} Kg</strong>
                <span>{{ record.source }}</span>
              </article>
            </div>

            <p v-else class="empty-note">No hay pesos registrados para este bovino.</p>
          </section>

          <section class="observations-section">
            <h2>Observaciones</h2>
            <p>{{ bovino.observations || 'Sin observaciones registradas.' }}</p>
          </section>

          <p class="info-note">El peso mostrado es una estimación y no sustituye el pesaje oficial en báscula.</p>
        </template>

        <section v-else class="empty-state">
          <strong>Bovino no encontrado.</strong>
          <span>Selecciona un bovino visible desde tus fincas asignadas.</span>
        </section>
      </section>

      <!-- Modal de edicion (RF4 / CU-04) -->
      <div v-if="editando" class="modal-backdrop" @click.self="cerrarEdicion">
        <form class="modal-card" @submit.prevent="guardarEdicion">
          <h2>Editar información</h2>

          <label>
            <span>Nombre del bovino</span>
            <input v-model="form.name" type="text" placeholder="Nombre" />
          </label>

          <label>
            <span>Raza</span>
            <select v-model="form.breedId">
              <option v-for="raza in razas" :key="raza.id" :value="raza.id">{{ raza.nombre }}</option>
            </select>
          </label>

          <label>
            <span>Sexo</span>
            <select v-model="form.sex">
              <option value="Macho">Macho</option>
              <option value="Hembra">Hembra</option>
            </select>
          </label>

          <label>
            <span>Observaciones</span>
            <textarea v-model="form.observations" rows="3" placeholder="Notas del animal (opcional)"></textarea>
          </label>

          <p class="readonly-note">El número de arete no se puede modificar.</p>
          <p v-if="editError" class="modal-error">{{ editError }}</p>

          <div class="modal-actions">
            <button type="button" class="modal-cancel" @click="cerrarEdicion">Cancelar</button>
            <button type="submit" class="modal-save">Guardar cambios</button>
          </div>
        </form>
      </div>

      <div v-if="inactivando" class="modal-backdrop" @click.self="cerrarInactivacion">
        <form class="modal-card" @submit.prevent="confirmarInactivacion">
          <h2>Marcar bovino inactivo</h2>
          <p class="readonly-note">
            El animal quedara fuera de la lista de activos, pero se conserva su historial.
          </p>

          <fieldset class="reason-options">
            <legend>Motivo</legend>
            <label v-for="option in motivosInactividad" :key="option">
              <input v-model="motivoInactividad" type="radio" :value="option" />
              <span>{{ option }}</span>
            </label>
          </fieldset>

          <label>
            <span>Detalle opcional</span>
            <textarea
              v-model="detalleInactividad"
              rows="2"
              placeholder="Ej. vendido a comprador local"
            ></textarea>
          </label>

          <p v-if="statusError" class="modal-error">{{ statusError }}</p>

          <div class="modal-actions">
            <button type="button" class="modal-cancel" :disabled="guardandoEstado" @click="cerrarInactivacion">
              Cancelar
            </button>
            <button type="submit" class="modal-save danger-save" :disabled="guardandoEstado">
              {{ guardandoEstado ? 'Guardando...' : 'Confirmar' }}
            </button>
          </div>
        </form>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonPage, onIonViewWillEnter } from '@ionic/vue';
import {
  analyticsOutline,
  chevronBackOutline,
  createOutline,
  documentTextOutline,
  downloadOutline,
  shareSocialOutline,
} from 'ionicons/icons';
import { computed, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { currentUser } from '@/modules/auth/services/sessionService';
import { bovinosRepo } from '@/shared/services/bovinosRepo';
import { fincasRepo } from '@/shared/services/fincasRepo';
import { razasRepo } from '@/shared/services/razasRepo';
import { bovinoPhoto, onBovinoPhotoError } from '@/shared/utils/bovinoPhoto';
import type { Bovino, Finca, Raza } from '@/shared/types/domain';
import {
  exportBovinoCsv,
  printBovinoReport,
  shareBovinoReport,
  type ReporteBovino,
} from '@/shared/services/reportService';

const route = useRoute();

const bovino = ref<Bovino | null>(null);
const fincas = ref<Finca[]>([]);
const razas = ref<Raza[]>([]);

const cargarBovino = async () => {
  const id = String(route.params.id);
  try {
    bovino.value = await bovinosRepo.get(id);
  } catch {
    bovino.value = null;
  }
};

onIonViewWillEnter(async () => {
  const [f, r] = await Promise.all([fincasRepo.list(), razasRepo.list()]);
  fincas.value = f;
  razas.value = r;
  await cargarBovino();
});

const orderedRecords = computed(() => {
  if (!bovino.value?.pesajes) return [];
  return [...bovino.value.pesajes].sort(
    (a, b) => parseRecordDate(a.date).getTime() - parseRecordDate(b.date).getTime(),
  );
});

const maxWeight = computed(() => Math.max(...orderedRecords.value.map((record) => record.weightKg), 1));
const finca = computed(() => fincas.value.find((item) => item.id === bovino.value?.farmId));
const canManageStatus = computed(() => {
  const role = currentUser.value?.role;
  return role === 'ganadero' || role === 'asistente' || role === 'admin';
});

const editando = ref(false);
const inactivando = ref(false);
const editError = ref('');
const statusError = ref('');
const guardandoEstado = ref(false);
const motivosInactividad = ['Vendido', 'Fallecido', 'Otro'];
const motivoInactividad = ref('Vendido');
const detalleInactividad = ref('');
const form = reactive({
  name: '',
  breedId: '',
  sex: 'Macho' as Bovino['sex'],
  observations: '',
});

const abrirEdicion = () => {
  if (!bovino.value) return;
  form.name = bovino.value.name;
  form.breedId = bovino.value.breedId;
  form.sex = bovino.value.sex;
  form.observations = bovino.value.observations ?? '';
  editError.value = '';
  editando.value = true;
};

const cerrarEdicion = () => {
  editando.value = false;
  editError.value = '';
};

const guardarEdicion = async () => {
  if (!bovino.value) return;
  editError.value = '';
  try {
    const actualizado = await bovinosRepo.update(bovino.value.id, {
      razaId: form.breedId,
      name: form.name,
      sex: form.sex,
      notes: form.observations,
    });
    bovino.value = actualizado;
    editando.value = false;
  } catch (error) {
    editError.value = error instanceof Error ? error.message : 'No fue posible guardar los cambios.';
  }
};

const abrirInactivacion = () => {
  if (!bovino.value) return;
  motivoInactividad.value = 'Vendido';
  detalleInactividad.value = '';
  statusError.value = '';
  inactivando.value = true;
};

const cerrarInactivacion = () => {
  if (guardandoEstado.value) return;
  inactivando.value = false;
  statusError.value = '';
};

const confirmarInactivacion = async () => {
  if (!bovino.value) return;
  statusError.value = '';

  const detalle = detalleInactividad.value.trim();
  const motivo = detalle ? `${motivoInactividad.value}: ${detalle}` : motivoInactividad.value;

  try {
    guardandoEstado.value = true;
    bovino.value = await bovinosRepo.inactivar(bovino.value.id, motivo);
    inactivando.value = false;
  } catch (error) {
    statusError.value = error instanceof Error ? error.message : 'No fue posible cambiar el estado.';
  } finally {
    guardandoEstado.value = false;
  }
};

const reactivar = async () => {
  if (!bovino.value) return;
  statusError.value = '';
  try {
    guardandoEstado.value = true;
    bovino.value = await bovinosRepo.activar(bovino.value.id);
  } catch (error) {
    statusError.value = error instanceof Error ? error.message : 'No fue posible reactivar el bovino.';
  } finally {
    guardandoEstado.value = false;
  }
};

const trendLabel = computed(() => {
  if (orderedRecords.value.length < 2) return 'Sin datos suficientes';
  const first = orderedRecords.value[0];
  const last = orderedRecords.value.at(-1);
  if (!last) return 'Sin datos suficientes';
  const difference = last.weightKg - first.weightKg;
  if (difference > 12) return 'Aumento de peso';
  if (difference < -12) return 'Posible baja de peso';
  return 'Peso estable';
});
const trendTone = computed(() => {
  if (trendLabel.value === 'Aumento de peso') return 'good';
  if (trendLabel.value === 'Posible baja de peso') return 'warning';
  return 'neutral';
});
const reporte = computed<ReporteBovino | null>(() => {
  if (!bovino.value) return null;
  return {
    bovino: bovino.value,
    finca: finca.value,
    registros: [...orderedRecords.value].reverse(),
  };
});

const barHeight = (weight: number) => Math.max(24, Math.round((weight / maxWeight.value) * 100));

function parseRecordDate(value: string) {
  const [day, month, year] = value.split('/').map(Number);
  return new Date(year, month - 1, day);
}

const shortDate = (value: string) => value.split('/').slice(0, 2).join('/');

const exportarCsv = () => {
  if (reporte.value) exportBovinoCsv(reporte.value);
};

const generarPdf = () => {
  if (reporte.value) printBovinoReport(reporte.value);
};

const compartirReporte = async () => {
  if (reporte.value) await shareBovinoReport(reporte.value);
};
</script>

<style scoped>
.page-surface {
  --background: #f5f8fb;
}

.page-surface::part(scroll) {
  display: block;
}

.detail-shell {
  width: 100%;
  max-width: 390px;
  min-height: 100%;
  margin: 0 auto;
  padding: var(--bw-page-pad-top) var(--bw-page-pad-x) var(--bw-page-pad-bottom-tabs);
  box-sizing: border-box;
}

.page-header {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 72px;
  text-align: center;
}

.back-button {
  position: absolute;
  left: 0;
  top: 19px;
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

.profile-card {
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  margin: 4px -18px 24px;
  padding: 12px 18px;
  background: #ffffff;
  border-block: 1px solid rgba(8, 37, 74, 0.08);
}

.profile-card img {
  width: 58px;
  height: 58px;
  border-radius: 8px;
  object-fit: cover;
}

.profile-card h2 {
  margin: 0;
  color: #071832;
  font-size: 14px;
  font-weight: 900;
}

.profile-card p,
.profile-card small {
  display: block;
  margin: 3px 0 0;
  color: #2f75b5;
  font-size: 11px;
  font-weight: 800;
}

.profile-card > span {
  border-radius: 999px;
  padding: 6px 12px;
  background: #d8e8f7;
  color: #052b66;
  font-size: 10px;
  font-weight: 900;
}

.chart-section,
.history-section,
.status-section,
.observations-section {
  display: grid;
  gap: 12px;
}

.chart-section h2,
.history-section h2,
.status-section h2,
.observations-section h2 {
  margin: 0;
  color: #052b66;
  font-size: 15px;
  font-weight: 900;
}

.chart-section h2 {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.trend-pill {
  width: max-content;
  margin: 0;
  border-radius: 999px;
  padding: 6px 10px;
  color: #052b66;
  font-size: 10px;
  font-weight: 900;
}

.trend-pill.good {
  background: #d8f3dc;
}

.trend-pill.warning {
  background: #fff4d6;
  color: #7a4b00;
}

.trend-pill.neutral {
  background: #d8e8f7;
}

.weight-chart {
  min-height: 148px;
  display: flex;
  align-items: stretch;
  gap: 12px;
  padding: 12px 10px;
  border-top: 2px solid #6e83a6;
  border-bottom: 2px solid #6e83a6;
  background:
    linear-gradient(#c7d2e2 1px, transparent 1px) 0 25% / 100% 25%,
    #ffffff;
}

.chart-point {
  flex: 1 1 0;
  min-width: 0;
  display: grid;
  grid-template-rows: 20px 1fr 18px;
  justify-items: center;
  align-items: end;
  gap: 4px;
}

.chart-point span {
  color: #052b66;
  font-size: 10px;
  font-weight: 900;
}

.chart-point b {
  width: 18px;
  min-height: 18px;
  border-radius: 4px 4px 0 0;
  background: #5b8fc0;
}

.chart-point:last-child b {
  background: #052b66;
}

.chart-point small {
  color: #566071;
  font-size: 9px;
  font-weight: 800;
}

.history-section {
  margin-top: 22px;
}

.status-section {
  margin-bottom: 22px;
}

.status-actions {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(8, 37, 74, 0.25) transparent;
  padding-bottom: 8px;
}

.status-actions::-webkit-scrollbar {
  height: 4px;
}

.status-actions::-webkit-scrollbar-thumb {
  background: rgba(8, 37, 74, 0.25);
  border-radius: 999px;
}

.status-actions button {
  min-height: 34px;
  border: 1px solid rgba(8, 37, 74, 0.12);
  border-radius: 999px;
  background: #ffffff;
  color: #052b66;
  padding: 0 12px;
  font-size: 10px;
  font-weight: 900;
  white-space: nowrap;
}

.status-actions button.active {
  background: #052b66;
  color: #ffffff;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.report-actions {
  display: inline-flex;
  gap: 6px;
}

.report-actions button {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(8, 37, 74, 0.12);
  border-radius: 8px;
  background: #ffffff;
  color: #052b66;
}

.report-actions ion-icon {
  font-size: 17px;
}

.history-panel {
  display: grid;
  gap: 12px;
  padding: 14px;
  border-radius: 10px;
  background: #071832;
  color: #ffffff;
}

.table-head,
.history-panel article {
  display: grid;
  grid-template-columns: 1fr 0.8fr 0.7fr;
  gap: 10px;
  align-items: center;
}

.table-head {
  color: #ffffff;
  font-size: 10px;
  font-weight: 900;
}

.history-panel article {
  color: #dbe8f7;
  font-size: 11px;
}

.history-panel strong {
  color: #ffffff;
  font-size: 11px;
}

.history-panel article span {
  justify-self: start;
  border-radius: 999px;
  padding: 5px 12px;
  background: #8bb7e5;
  color: #052b66;
  font-size: 10px;
  font-weight: 900;
}

.observations-section {
  margin-top: 18px;
  padding: 14px;
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid rgba(8, 37, 74, 0.08);
}

.observations-section p {
  margin: 0;
  color: #566071;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.35;
}

.info-note {
  margin: 16px 0 0;
  padding: 11px 12px;
  border-left: 4px solid #2f75b5;
  border-radius: 8px;
  background: #d8e8f7;
  color: #052b66;
  font-size: 11px;
  font-weight: 800;
  line-height: 1.35;
}

.empty-note,
.empty-state {
  color: #566071;
  text-align: center;
}

.empty-note {
  margin: 0;
  padding: 22px;
  border: 1px dashed rgba(8, 37, 74, 0.18);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  font-weight: 800;
}

.empty-state {
  min-height: 360px;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 8px;
}

.empty-state strong {
  color: #071832;
  font-size: 14px;
}

.empty-state span {
  max-width: 240px;
  font-size: 12px;
  line-height: 1.4;
}
.edit-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 46px;
  margin-bottom: 18px;
  border: 1px solid rgba(8, 37, 74, 0.16);
  border-radius: 999px;
  background: var(--bw-white, #ffffff);
  color: var(--bw-primary, #052b66);
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
}

.edit-button ion-icon {
  font-size: 18px;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 16px 16px calc(var(--bw-tab-bar-height) + var(--bw-safe-bottom) + 18px);
  background: rgba(7, 24, 50, 0.45);
}

.modal-card {
  width: 100%;
  max-width: 430px;
  display: grid;
  gap: 12px;
  max-height: calc(100vh - var(--bw-tab-bar-height) - var(--bw-safe-bottom) - 72px);
  overflow-y: auto;
  padding: 20px 18px 18px;
  border-radius: 16px 16px 10px 10px;
  background: var(--bw-surface, #f5f8fb);
  box-shadow: 0 -10px 30px rgba(7, 24, 50, 0.25);
}

.modal-card h2 {
  margin: 0 0 4px;
  color: var(--bw-header, #08254a);
  font-size: 16px;
  font-weight: 900;
}

.modal-card label {
  display: grid;
  gap: 6px;
}

.modal-card label span {
  color: var(--bw-header, #08254a);
  font-size: 11px;
  font-weight: 900;
}

.modal-card input,
.modal-card select,
.modal-card textarea {
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

.modal-card textarea {
  resize: none;
}

.reason-options {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  border: 0;
}

.reason-options legend {
  margin-bottom: 2px;
  color: var(--bw-header, #08254a);
  font-size: 11px;
  font-weight: 900;
}

.reason-options label {
  min-height: 38px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  border: 1px solid var(--bw-border, #e4e8ef);
  border-radius: 8px;
  background: var(--bw-white, #ffffff);
  color: var(--bw-text, #071832);
  font-size: 12px;
  font-weight: 800;
}

.reason-options input {
  width: 16px;
  height: 16px;
  accent-color: var(--bw-primary, #052b66);
}

.readonly-note {
  margin: 0;
  color: var(--bw-text-secondary, #566071);
  font-size: 11px;
  font-weight: 700;
}

.modal-error {
  margin: 0;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(217, 45, 32, 0.1);
  color: var(--bw-error-text, #b42318);
  font-size: 11px;
  font-weight: 800;
}

.modal-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 4px;
}

.modal-cancel,
.modal-save {
  min-height: 46px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
}

.modal-cancel {
  border: 1px solid rgba(8, 37, 74, 0.16);
  background: var(--bw-white, #ffffff);
  color: var(--bw-header, #08254a);
}

.modal-save {
  border: none;
  background: var(--bw-primary, #052b66);
  color: var(--bw-white, #ffffff);
}

.danger-save {
  background: var(--bw-error-text, #b42318);
}
</style>
