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
            <img :src="bovino.photoUrl" :alt="`Foto de ${bovino.name}`" />
            <div>
              <h2>{{ bovino.name }}</h2>
              <p>{{ bovino.breed }} - {{ bovino.sex }} - Arete</p>
              <small>{{ bovino.earTag }}</small>
            </div>
            <span>{{ bovino.status }}</span>
          </section>

          <section v-if="canManageStatus" class="status-section">
            <h2>Estado del animal</h2>
            <div class="status-actions">
              <button
                v-for="option in statusOptions"
                :key="option"
                type="button"
                :class="{ active: bovino.status === option }"
                @click="bovino.status = option"
              >
                {{ option }}
              </button>
            </div>
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
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import {
  analyticsOutline,
  chevronBackOutline,
  documentTextOutline,
  downloadOutline,
  shareSocialOutline,
} from 'ionicons/icons';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { currentUser } from '@/modules/auth/services/sessionService';
import { bovinos, fincas, registrosPeso } from '@/shared/data/mockData';
import type { Bovino } from '@/shared/types/domain';
import {
  exportBovinoCsv,
  printBovinoReport,
  shareBovinoReport,
  type ReporteBovino,
} from '@/shared/services/reportService';

const route = useRoute();
const assignedFarmIds = computed(() => currentUser.value?.assignedFarmIds ?? []);

const bovino = computed(() => {
  return bovinos.find((item) => {
    return item.id === route.params.id && assignedFarmIds.value.includes(item.farmId);
  });
});

const orderedRecords = computed(() => {
  if (!bovino.value) {
    return [];
  }

  return registrosPeso
    .filter((record) => record.bovinoId === bovino.value?.id)
    .sort((a, b) => parseRecordDate(a.date).getTime() - parseRecordDate(b.date).getTime());
});

const maxWeight = computed(() => Math.max(...orderedRecords.value.map((record) => record.weightKg), 1));
const finca = computed(() => fincas.find((item) => item.id === bovino.value?.farmId));
const canManageStatus = computed(() => currentUser.value?.role === 'ganadero');
const statusOptions: Bovino['status'][] = ['Activo', 'Vendido', 'Fallecido', 'Inactivo'];
const trendLabel = computed(() => {
  if (orderedRecords.value.length < 2) {
    return 'Sin datos suficientes';
  }

  const first = orderedRecords.value[0];
  const last = orderedRecords.value.at(-1);

  if (!last) {
    return 'Sin datos suficientes';
  }

  const difference = last.weightKg - first.weightKg;

  if (difference > 12) {
    return 'Aumento de peso';
  }

  if (difference < -12) {
    return 'Posible baja de peso';
  }

  return 'Peso estable';
});
const trendTone = computed(() => {
  if (trendLabel.value === 'Aumento de peso') {
    return 'good';
  }

  if (trendLabel.value === 'Posible baja de peso') {
    return 'warning';
  }

  return 'neutral';
});
const reporte = computed<ReporteBovino | null>(() => {
  if (!bovino.value) {
    return null;
  }

  return {
    bovino: bovino.value,
    finca: finca.value,
    registros: [...orderedRecords.value].reverse(),
  };
});

const barHeight = (weight: number) => {
  return Math.max(24, Math.round((weight / maxWeight.value) * 100));
};

function parseRecordDate(value: string) {
  const [day, month, year] = value.split('/').map(Number);
  return new Date(year, month - 1, day);
}

const shortDate = (value: string) => value.split('/').slice(0, 2).join('/');

const exportarCsv = () => {
  if (reporte.value) {
    exportBovinoCsv(reporte.value);
  }
};

const generarPdf = () => {
  if (reporte.value) {
    printBovinoReport(reporte.value);
  }
};

const compartirReporte = async () => {
  if (reporte.value) {
    await shareBovinoReport(reporte.value);
  }
};
</script>

<style scoped>
.page-surface {
  --background: #f5f8fb;
}

.page-surface::part(scroll) {
  display: flex;
  justify-content: center;
}

.detail-shell {
  width: 100%;
  max-width: 390px;
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
  padding-bottom: 2px;
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
</style>
