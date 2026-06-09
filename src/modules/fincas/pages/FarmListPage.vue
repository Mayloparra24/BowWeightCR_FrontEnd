<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-title>Fincas asignadas</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="page-surface">
      <section class="content">
        <label class="search-box">
          <ion-icon :icon="searchOutline" />
          <input v-model="search" type="search" placeholder="Buscar finca..." />
        </label>

        <div class="farm-list">
          <article v-for="farm in visibleFarms" :key="farm.id" class="farm-card">
            <div class="pin">
              <ion-icon :icon="locationOutline" />
            </div>
            <div>
              <h2>{{ farm.name }}</h2>
              <p>{{ farm.location }} · {{ farm.cattleCount }} cabezas</p>
            </div>
            <router-link to="/app/bovinos">Ver bovinos</router-link>
          </article>
        </div>

        <p class="notice">
          Solo se muestran las fincas asignadas segun el rol del usuario.
        </p>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { locationOutline, searchOutline } from 'ionicons/icons';
import { computed, ref } from 'vue';
import { currentUser } from '@/modules/auth/services/sessionService';
import { farms } from '@/shared/data/mockData';

const search = ref('');

const visibleFarms = computed(() => {
  const assignedIds = currentUser.value?.assignedFarmIds ?? [];
  const normalizedSearch = search.value.trim().toLowerCase();

  return farms.filter((farm) => {
    const isAssigned = assignedIds.includes(farm.id);
    const matchesSearch = farm.name.toLowerCase().includes(normalizedSearch);

    return isAssigned && matchesSearch;
  });
});
</script>

<style scoped>
.page-surface {
  --background: #ffffff;
}

.content {
  padding: 22px 20px;
}

.search-box {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  border-radius: 8px;
  background: #d9d9d9;
  color: #071832;
}

.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #071832;
}

.farm-list {
  display: grid;
  gap: 16px;
  margin-top: 22px;
}

.farm-card {
  min-height: 56px;
  display: grid;
  grid-template-columns: 34px 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 12px;
  border-radius: 7px;
  background: #052b66;
  color: #ffffff;
}

.pin {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #cfeaff;
  color: #052b66;
}

h2 {
  margin: 0;
  font-size: 13px;
  font-weight: 800;
}

p {
  margin: 4px 0 0;
  color: #cfe0f5;
  font-size: 11px;
}

a {
  color: #8bb7e5;
  font-size: 11px;
  font-weight: 800;
  text-decoration: none;
}

.notice {
  margin: 34px 0 0;
  padding: 10px;
  background: #fff08a;
  color: #74601d;
  text-align: center;
  font-size: 12px;
}
</style>
