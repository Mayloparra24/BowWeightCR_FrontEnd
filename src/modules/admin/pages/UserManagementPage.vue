<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-title>Gestion de usuarios</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="page-surface">
      <section class="content">
        <p class="summary">{{ users.length }} registrados · {{ activeCount }} activos · {{ inactiveCount }} inactivos</p>

        <label class="search-box">
          <ion-icon :icon="searchOutline" />
          <input v-model="search" type="search" placeholder="Buscar por nombre o correo..." />
        </label>

        <button class="create-button" type="button">
          <ion-icon :icon="personAddOutline" />
          Crear nuevo usuario
        </button>

        <div class="filter-row">
          <button
            v-for="option in filters"
            :key="option"
            :class="{ active: selectedFilter === option }"
            type="button"
            @click="selectedFilter = option"
          >
            {{ option }}
          </button>
        </div>

        <div class="user-list">
          <article v-for="user in visibleUsers" :key="user.id" class="user-row">
            <div>
              <h2>{{ user.fullName }}</h2>
              <p>{{ user.email }}</p>
            </div>
            <span class="pill role">{{ roleLabel(user.role) }}</span>
            <span class="pill" :class="user.status">{{ user.status }}</span>
          </article>
        </div>

        <p class="notice">Toca "Ver" para ver detalle y asignar fincas al veterinario.</p>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { personAddOutline, searchOutline } from 'ionicons/icons';
import { computed, ref } from 'vue';
import { demoUsers } from '@/shared/data/mockData';
import type { UserRole } from '@/shared/types/domain';

const users = demoUsers;
const search = ref('');
const selectedFilter = ref('Todos');
const filters = ['Todos', 'Ganaderos', 'Veterinarios', 'Inactivos'];

const activeCount = computed(() => users.filter((user) => user.status === 'activo').length);
const inactiveCount = computed(() => users.filter((user) => user.status === 'inactivo').length);

const roleLabel = (role: UserRole) => {
  if (role === 'admin') {
    return 'Admin';
  }

  if (role === 'veterinario') {
    return 'Veterinario';
  }

  return 'Ganadero';
};

const visibleUsers = computed(() => {
  const normalizedSearch = search.value.trim().toLowerCase();

  return users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(normalizedSearch) ||
      user.email.toLowerCase().includes(normalizedSearch);
    const matchesFilter =
      selectedFilter.value === 'Todos' ||
      (selectedFilter.value === 'Ganaderos' && user.role === 'ganadero') ||
      (selectedFilter.value === 'Veterinarios' && user.role === 'veterinario') ||
      (selectedFilter.value === 'Inactivos' && user.status === 'inactivo');

    return matchesSearch && matchesFilter;
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

.summary {
  margin: 0 0 18px;
  color: #566071;
  text-align: center;
  font-size: 13px;
}

.search-box {
  min-height: 46px;
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
}

.create-button {
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 20px 0 14px;
  padding: 0 14px;
  border: 0;
  border-radius: 999px;
  background: #052b66;
  color: #ffffff;
  font-weight: 800;
}

.filter-row {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 12px;
}

.filter-row button {
  border: 0;
  border-radius: 999px;
  background: #a8acb8;
  color: #052b66;
  font-size: 12px;
  font-weight: 800;
  padding: 9px 14px;
  white-space: nowrap;
}

.filter-row .active {
  background: #052b66;
  color: #ffffff;
}

.user-list {
  display: grid;
  gap: 8px;
  padding: 14px;
  border-radius: 8px;
  background: #071832;
}

.user-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 8px;
  align-items: center;
  color: #ffffff;
}

h2 {
  margin: 0;
  font-size: 13px;
  font-weight: 800;
}

p {
  margin: 3px 0 0;
  color: #cfe0f5;
  font-size: 11px;
}

.pill {
  border-radius: 999px;
  padding: 6px 9px;
  background: #95f596;
  color: #073b0b;
  font-size: 11px;
  font-weight: 800;
  text-transform: capitalize;
}

.pill.role {
  background: #d8e7fb;
  color: #052b66;
}

.pill.inactivo {
  background: #ff7373;
  color: #571010;
}

.notice {
  margin-top: 18px;
  padding: 10px;
  background: #fff08a;
  color: #74601d;
  text-align: center;
  font-size: 12px;
}
</style>
