<template>
  <ion-page>
    <ion-content class="page-surface">
      <section class="animal-shell">
        <header class="page-header">
          <router-link class="back-button" to="/app/inicio" aria-label="Volver al inicio">
            <ion-icon :icon="chevronBackOutline" />
          </router-link>

          <div>
            <h1>Bovinos</h1>
            <p>{{ bovinosVisibles.length }} disponibles</p>
          </div>
          <button
            class="export-button"
            type="button"
            aria-label="Exportar inventario"
            :disabled="!bovinosVisibles.length"
            @click="exportarInventario"
          >
            <ion-icon :icon="downloadOutline" />
          </button>
        </header>

        <label class="search-box">
          <ion-icon :icon="searchOutline" />
          <input v-model="search" type="search" placeholder="Buscar bovino..." />
        </label>

        <div v-if="bovinosVisibles.length" class="animal-list">
          <BovinoListItem v-for="bovino in bovinosVisibles" :key="bovino.id" :bovino="bovino" />
        </div>

        <section v-else class="empty-state">
          <strong>No hay bovinos disponibles.</strong>
          <span>Cuando existan bovinos en tus fincas asignadas, aparecerán aquí.</span>
        </section>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonPage, onIonViewWillEnter } from '@ionic/vue';
import { chevronBackOutline, downloadOutline, searchOutline } from 'ionicons/icons';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { bovinosRepo } from '@/shared/services/bovinosRepo';
import { fincasRepo } from '@/shared/services/fincasRepo';
import BovinoListItem from '@/shared/components/BovinoListItem.vue';
import { exportInventarioCsv } from '@/shared/services/reportService';
import type { Bovino, Finca } from '@/shared/types/domain';

const search = ref('');
const route = useRoute();

const bovinos = ref<Bovino[]>([]);
const fincas = ref<Finca[]>([]);

onIonViewWillEnter(async () => {
  const [b, f] = await Promise.all([bovinosRepo.list(), fincasRepo.list()]);
  bovinos.value = b;
  fincas.value = f;
});

const bovinosVisibles = computed(() => {
  const selectedFarmId = typeof route.query.finca === 'string' ? route.query.finca : '';
  const normalizedSearch = search.value.trim().toLowerCase();

  return bovinos.value.filter((bovino) => {
    const matchesFarm = !selectedFarmId || bovino.farmId === selectedFarmId;
    const matchesSearch =
      bovino.name.toLowerCase().includes(normalizedSearch) ||
      bovino.earTag.includes(normalizedSearch);
    return matchesFarm && matchesSearch;
  });
});

const exportarInventario = () => {
  exportInventarioCsv(bovinosVisibles.value, fincas.value);
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

.animal-shell {
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

.export-button {
  position: absolute;
  right: 0;
  top: 19px;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(8, 37, 74, 0.1);
  border-radius: 8px;
  background: #ffffff;
  color: #052b66;
  box-shadow: 0 10px 22px rgba(8, 37, 74, 0.08);
}

.export-button:disabled {
  opacity: 0.4;
}

.export-button ion-icon {
  font-size: 17px;
}

h1 {
  margin: 0;
  color: #071832;
  font-size: 15px;
  font-weight: 900;
}

.page-header p {
  margin: 4px 0 0;
  color: #566071;
  font-size: 11px;
  font-weight: 800;
}

.search-box {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  border: 1px solid rgba(8, 37, 74, 0.1);
  border-radius: 8px;
  background: #ffffff;
  color: #071832;
  box-shadow: 0 12px 24px rgba(8, 37, 74, 0.06);
}

.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #071832;
  font-size: 13px;
}

.animal-list {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.empty-state {
  min-height: 260px;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 8px;
  margin-top: 18px;
  border: 1px dashed rgba(8, 37, 74, 0.18);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.7);
  color: #566071;
  text-align: center;
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
