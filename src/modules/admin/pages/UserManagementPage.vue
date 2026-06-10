<template>
  <ion-page>
    <ion-content class="page-surface">
      <section class="content">
        <header class="page-header">
          <router-link class="back-button" to="/app/inicio" aria-label="Volver al inicio">
            <ion-icon :icon="chevronBackOutline" />
          </router-link>

          <div>
            <h1>Gestión de usuarios</h1>
            <p>{{ users.length }} registrados - {{ activeCount }} activos - {{ inactiveCount }} inactivos</p>
          </div>
        </header>

        <label class="search-box">
          <ion-icon :icon="searchOutline" />
          <input v-model="search" type="search" placeholder="Buscar por nombre o correo..." />
        </label>

        <router-link class="create-button" to="/app/usuarios/crear">
          <ion-icon :icon="personAddOutline" />
          Crear nuevo usuario
        </router-link>

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

        <section class="user-panel" :class="{ empty: !visibleUsers.length }" aria-label="Listado de usuarios">
          <div v-if="visibleUsers.length" class="table-head">
            <span>Nombre</span>
            <span>Rol</span>
            <span>Estado</span>
            <span>Acciones</span>
          </div>

          <article v-for="user in visibleUsers" :key="user.id" class="user-row">
            <div>
              <h2>{{ user.fullName }}</h2>
              <p>{{ user.email }}</p>
            </div>
            <span class="pill role">{{ roleLabel(user.role) }}</span>
            <span class="pill" :class="user.status">{{ user.status }}</span>
            <router-link :to="`/app/usuarios/${user.id}`">Ver</router-link>
          </article>

          <div v-if="!visibleUsers.length" class="empty-state">
            <strong>No hay usuarios registrados.</strong>
            <span>Crea el primer usuario para habilitar accesos al sistema.</span>
          </div>
        </section>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { chevronBackOutline, personAddOutline, searchOutline } from 'ionicons/icons';
import { computed, ref } from 'vue';
import { usuariosAdmin } from '@/modules/admin/data/users';
import type { Rol } from '@/shared/types/domain';

const users = usuariosAdmin;
const search = ref('');
const selectedFilter = ref('Todos');
const filters = ['Todos', 'Ganaderos', 'Veterinarios', 'Inactivos'];

const activeCount = computed(() => users.filter((user) => user.status === 'activo').length);
const inactiveCount = computed(() => users.filter((user) => user.status === 'inactivo').length);

const roleLabel = (role: Rol) => {
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
  width: 100%;
  max-width: 390px;
  min-height: 100%;
  margin: 0 auto;
  padding: 22px 18px 28px;
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

.back-button ion-icon {
  font-size: 20px;
}

h1 {
  margin: 0;
  color: #071832;
  font-size: 15px;
  font-weight: 900;
}

.page-header p {
  margin: 4px 0 0;
  color: #2f75b5;
  font-size: 11px;
  font-weight: 800;
}

.search-box {
  width: 100%;
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 22px;
  padding: 0 13px;
  border-radius: 8px;
  background: #d9d9d9;
  color: #071832;
}

.search-box ion-icon {
  font-size: 19px;
}

.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #071832;
  font-size: 13px;
}

.create-button {
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 20px 0 14px;
  padding: 0 13px;
  border: 0;
  border-radius: 999px;
  background: #052b66;
  color: #ffffff;
  font-size: 13px;
  font-weight: 900;
  text-decoration: none;
}

.create-button ion-icon {
  font-size: 18px;
}

.filter-row {
  display: flex;
  gap: 7px;
  overflow-x: auto;
  padding-bottom: 13px;
}

.filter-row button {
  border: 0;
  border-radius: 999px;
  background: #a8acb8;
  color: #052b66;
  font-size: 11px;
  font-weight: 900;
  padding: 8px 13px;
  white-space: nowrap;
}

.filter-row .active {
  background: #052b66;
  color: #ffffff;
}

.user-panel {
  min-height: 204px;
  display: grid;
  align-content: start;
  gap: 12px;
  padding: 15px 12px;
  border-radius: 8px;
  background: #071832;
  color: #ffffff;
}

.user-panel.empty {
  place-items: center;
  align-content: center;
}

.table-head {
  display: grid;
  grid-template-columns: minmax(74px, 1.2fr) 0.75fr 0.75fr 0.85fr;
  gap: 8px;
  color: #ffffff;
  font-size: 10px;
  font-weight: 900;
}

.user-row {
  display: grid;
  grid-template-columns: minmax(74px, 1.2fr) 0.75fr 0.75fr 0.85fr;
  gap: 8px;
  align-items: center;
}

h2 {
  margin: 0;
  color: #ffffff;
  font-size: 11px;
  font-weight: 900;
}

.user-row p {
  margin: 2px 0 0;
  color: #cfe0f5;
  font-size: 10px;
}

.pill {
  justify-self: start;
  border-radius: 999px;
  padding: 5px 7px;
  background: #d8e8f7;
  color: #052b66;
  font-size: 10px;
  font-weight: 900;
  text-transform: capitalize;
}

.pill.role {
  background: #b7d8f0;
  color: #052b66;
}

.pill.inactivo {
  background: #ff7373;
  color: #571010;
}

.user-row a {
  min-height: 25px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 999px;
  background: #6f7a8a;
  color: #ffffff;
  font-size: 10px;
  font-weight: 900;
  text-decoration: none;
}

.empty-state {
  display: grid;
  gap: 6px;
  place-items: center;
  padding: 26px 8px;
  color: #cfe0f5;
  text-align: center;
}

.empty-state strong {
  color: #ffffff;
  font-size: 13px;
}

.empty-state span {
  max-width: 220px;
  font-size: 11px;
  line-height: 1.35;
}
</style>
