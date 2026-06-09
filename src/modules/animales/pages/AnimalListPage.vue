<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-title>Lista de Bovinos</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="page-surface">
      <section class="content">
        <div class="search-row">
          <label class="search-box">
            <ion-icon :icon="searchOutline" />
            <input v-model="search" type="search" placeholder="Buscar bovino..." />
          </label>
          <button class="filter-button" type="button" aria-label="Filtrar bovinos">
            <ion-icon :icon="filterOutline" />
          </button>
        </div>

        <h1>Bovinos</h1>
        <div class="animal-list">
          <AnimalListItem v-for="animal in visibleAnimals" :key="animal.id" :animal="animal" />
        </div>

        <p v-if="visibleAnimals.length === 0" class="empty-state">
          No se encontraron bovinos para esta busqueda.
        </p>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { filterOutline, searchOutline } from 'ionicons/icons';
import { computed, ref } from 'vue';
import { currentUser } from '@/modules/auth/services/sessionService';
import { animals } from '@/shared/data/mockData';
import AnimalListItem from '@/shared/components/AnimalListItem.vue';

const search = ref('');

const visibleAnimals = computed(() => {
  const assignedFarmIds = currentUser.value?.assignedFarmIds ?? [];
  const normalizedSearch = search.value.trim().toLowerCase();

  return animals.filter((animal) => {
    const canSeeFarm = assignedFarmIds.includes(animal.farmId);
    const matchesSearch =
      animal.name.toLowerCase().includes(normalizedSearch) ||
      animal.earTag.includes(normalizedSearch);

    return canSeeFarm && matchesSearch;
  });
});
</script>

<style scoped>
.page-surface {
  --background: #ffffff;
}

.content {
  padding: 20px;
}

.search-row {
  display: grid;
  grid-template-columns: 1fr 48px;
  gap: 12px;
  align-items: center;
}

.search-box {
  min-height: 46px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  border: 1px solid #d7dce5;
  border-radius: 8px;
  color: #071832;
}

.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
}

.filter-button {
  width: 48px;
  height: 46px;
  border: 0;
  border-radius: 8px;
  background: #f3f5fa;
  color: #052b66;
  font-size: 20px;
}

h1 {
  margin: 18px 0 8px;
  color: #052b66;
  font-size: 20px;
  font-weight: 900;
}

.animal-list {
  display: grid;
  gap: 8px;
}

.empty-state {
  margin-top: 26px;
  color: #566071;
  text-align: center;
}
</style>
