<template>
  <ion-page>
    <ion-content class="page-surface">
      <main class="report-shell">
        <header class="report-header">
          <div>
            <p>BovWeightCR</p>
            <h1>Reporte de animales disponibles</h1>
            <span>{{ visibleBovinos.length }} animales - {{ fincaName }}</span>
          </div>
        </header>

        <section class="action-row">
          <button type="button" @click="printReport">
            <ion-icon :icon="documentTextOutline" />
            PDF
          </button>
          <button type="button" @click="exportCsv">
            <ion-icon :icon="downloadOutline" />
            CSV
          </button>
          <button type="button" @click="shareReport">
            <ion-icon :icon="shareSocialOutline" />
            Compartir
          </button>
        </section>

        <p class="estimate-note">
          El peso mostrado es una estimación y no sustituye el pesaje oficial en báscula.
        </p>

        <section class="report-list">
          <article v-for="bovino in visibleBovinos" :key="bovino.id" class="report-card">
            <img :src="bovinoPhoto(bovino.photoUrl)" :alt="`Foto de ${bovino.name}`" @error="onBovinoPhotoError" />
            <div>
              <h2>{{ bovino.name }}</h2>
              <p>{{ bovino.earTag }}</p>
              <span>{{ farmName(bovino.farmId) }} - {{ bovino.status }}</span>
              <small>Último pesaje: {{ bovino.lastWeightDate || 'Sin registro' }}</small>
            </div>
            <strong>{{ bovino.lastWeightKg }}<small>kg</small></strong>
          </article>
        </section>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { documentTextOutline, downloadOutline, shareSocialOutline } from 'ionicons/icons';
import { computed } from 'vue';
import { bovinos, fincas } from '@/shared/data/mockData';
import { currentUser } from '@/modules/auth/services/sessionService';
import { exportInventarioCsv, exportInventarioPdf, shareInventarioPdf } from '@/shared/services/reportService';
import { bovinoPhoto, onBovinoPhotoError } from '@/shared/utils/bovinoPhoto';

const assignedFarmIds = computed(() => currentUser.value?.assignedFarmIds ?? ['farm-esperanza']);
const visibleBovinos = computed(() => {
  return bovinos.filter((bovino) => assignedFarmIds.value.includes(bovino.farmId) && bovino.status === 'Activo');
});

const fincaName = computed(() => {
  const names = fincas
    .filter((finca) => assignedFarmIds.value.includes(finca.id))
    .map((finca) => finca.name);

  return names.length ? names.join(' - ') : 'Reporte compartido';
});

const farmName = (farmId: string) => fincas.find((finca) => finca.id === farmId)?.name ?? 'Sin finca';

const exportCsv = async () => {
  await exportInventarioCsv(visibleBovinos.value, fincas);
};

const printReport = async () => {
  await exportInventarioPdf(visibleBovinos.value, fincas, fincaName.value);
};

const shareReport = async () => {
  await shareInventarioPdf(visibleBovinos.value, fincas, fincaName.value);
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

.report-shell {
  width: 100%;
  max-width: 430px;
  min-height: 100%;
  display: grid;
  align-content: start;
  gap: 16px;
  margin: 0 auto;
  padding: 24px 18px 104px;
  box-sizing: border-box;
}

.report-header {
  padding: 18px;
  border-radius: 8px;
  background: #052b66;
  color: #ffffff;
  box-shadow: 0 18px 30px rgba(8, 37, 74, 0.16);
}

.report-header p,
.report-header h1,
.report-header span {
  margin: 0;
}

.report-header p {
  color: #cfe0f5;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
}

.report-header h1 {
  margin-top: 8px;
  font-size: 20px;
  font-weight: 900;
  line-height: 1.15;
}

.report-header span {
  display: block;
  margin-top: 8px;
  color: #d8e8f7;
  font-size: 12px;
  font-weight: 800;
}

.action-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.action-row button {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid rgba(8, 37, 74, 0.1);
  border-radius: 8px;
  background: #ffffff;
  color: #052b66;
  font-size: 11px;
  font-weight: 900;
}

.estimate-note {
  margin: 0;
  padding: 11px 12px;
  border-left: 4px solid #2f75b5;
  border-radius: 8px;
  background: #d8e8f7;
  color: #052b66;
  font-size: 11px;
  font-weight: 900;
  line-height: 1.35;
}

.report-list {
  display: grid;
  gap: 10px;
}

.report-card {
  min-height: 92px;
  display: grid;
  grid-template-columns: 68px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  background: #ffffff;
  color: #071832;
  box-shadow: 0 12px 24px rgba(8, 37, 74, 0.08);
}

.report-card img {
  width: 68px;
  height: 68px;
  border-radius: 8px;
  object-fit: cover;
}

.report-card h2,
.report-card p,
.report-card span,
.report-card small {
  display: block;
  margin: 0;
}

.report-card h2 {
  font-size: 14px;
  font-weight: 900;
}

.report-card p,
.report-card span,
.report-card small {
  margin-top: 3px;
  color: #566071;
  font-size: 10px;
  font-weight: 800;
}

.report-card span {
  color: #2f75b5;
}

.report-card strong {
  color: #052b66;
  font-size: 24px;
  font-weight: 900;
  white-space: nowrap;
}

.report-card strong small {
  margin-left: 3px;
  font-size: 11px;
}

@media print {
  .action-row {
    display: none;
  }

  .report-shell {
    max-width: none;
    padding: 0;
  }
}
</style>
