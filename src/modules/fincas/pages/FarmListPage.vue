<template>
  <ion-page>
    <ion-content class="page-surface">
      <section class="farm-shell">
        <header class="page-header">
          <router-link class="back-button" to="/app/inicio" aria-label="Volver al inicio">
            <ion-icon :icon="chevronBackOutline" />
          </router-link>

          <div>
            <h1 class="page-title">{{ pageTitle }}</h1>
            <p>{{ visibleFarms.length }} {{ visibleFarms.length === 1 ? 'registrada' : 'registradas' }}</p>
          </div>
        </header>

        <p class="info-note">{{ infoText }}</p>

        <button v-if="isFarmer" type="button" class="add-button" @click="abrirCrear">
          <ion-icon :icon="addOutline" />
          Agregar finca
        </button>

        <label class="search-box">
          <ion-icon :icon="searchOutline" />
          <input v-model="search" type="search" placeholder="Buscar finca..." />
        </label>

        <div v-if="visibleFarms.length" class="farm-list">
          <article v-for="farm in visibleFarms" :key="farm.id" class="farm-card">
            <div class="pin">
              <ion-icon :icon="locationOutline" />
            </div>
            <div>
              <h2>{{ farm.name }}</h2>
              <p>{{ farm.location }} - {{ farm.cattleCount }} cabezas</p>
            </div>
            <div class="farm-actions">
              <router-link :to="`/app/bovinos?finca=${farm.id}`">Ver</router-link>
              <button v-if="isFarmer" type="button" class="icon-action" aria-label="Editar finca" @click="abrirEditar(farm)">
                <ion-icon :icon="createOutline" />
              </button>
              <button v-if="isFarmer" type="button" class="icon-action danger" aria-label="Eliminar finca" @click="quitarFinca(farm)">
                <ion-icon :icon="trashOutline" />
              </button>
            </div>
          </article>
        </div>

        <section v-else class="empty-state">
          <strong>{{ emptyTitle }}</strong>
          <span>{{ emptyText }}</span>
        </section>
      </section>

      <!-- Modal crear / editar finca (RF8 / CU-08) -->
      <div v-if="modalAbierto" class="modal-backdrop" @click.self="cerrarModal">
        <form class="modal-card" @submit.prevent="guardar">
          <h2>{{ editandoId ? 'Editar finca' : 'Agregar finca' }}</h2>

          <label>
            <span>Nombre de la finca</span>
            <input v-model="form.name" type="text" placeholder="Ej. La Esperanza" />
          </label>

          <label>
            <span>Ubicación</span>
            <input v-model="form.location" type="text" placeholder="Ej. Liberia" />
          </label>

          <p v-if="modalError" class="modal-error">{{ modalError }}</p>

          <div class="modal-actions">
            <button type="button" class="modal-cancel" @click="cerrarModal">Cancelar</button>
            <button type="submit" class="modal-save">Guardar</button>
          </div>
        </form>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { addOutline, chevronBackOutline, createOutline, locationOutline, searchOutline, trashOutline } from 'ionicons/icons';
import { computed, reactive, ref } from 'vue';
import { currentUser } from '@/modules/auth/services/sessionService';
import { fincas } from '@/shared/data/mockData';
import type { Finca } from '@/shared/types/domain';
import { actualizarFinca, crearFinca, eliminarFinca } from '@/shared/services/fincaService';

const search = ref('');
const isFarmer = computed(() => currentUser.value?.role === 'ganadero');

const modalAbierto = ref(false);
const editandoId = ref('');
const modalError = ref('');
const form = reactive({ name: '', location: '' });

const abrirCrear = () => {
  editandoId.value = '';
  form.name = '';
  form.location = '';
  modalError.value = '';
  modalAbierto.value = true;
};

const abrirEditar = (farm: Finca) => {
  editandoId.value = farm.id;
  form.name = farm.name;
  form.location = farm.location;
  modalError.value = '';
  modalAbierto.value = true;
};

const cerrarModal = () => {
  modalAbierto.value = false;
  modalError.value = '';
};

const guardar = () => {
  modalError.value = '';

  try {
    if (editandoId.value) {
      actualizarFinca(editandoId.value, { name: form.name, location: form.location });
    } else {
      crearFinca({ name: form.name, location: form.location }, currentUser.value?.assignedFarmIds);
    }
    modalAbierto.value = false;
  } catch (error) {
    modalError.value = error instanceof Error ? error.message : 'No fue posible guardar la finca.';
  }
};

const quitarFinca = (farm: Finca) => {
  try {
    eliminarFinca(farm.id, currentUser.value?.assignedFarmIds);
  } catch (error) {
    modalError.value = error instanceof Error ? error.message : 'No fue posible eliminar la finca.';
    editandoId.value = '';
    modalAbierto.value = true;
  }
};

const pageTitle = computed(() => (isFarmer.value ? 'Mis fincas' : 'Fincas asignadas'));

const infoText = computed(() => {
  if (isFarmer.value) {
    return 'Aquí se muestran las fincas registradas para tu cuenta.';
  }

  return 'Solo se muestran las fincas que el administrador te ha asignado.';
});

const emptyTitle = computed(() => (isFarmer.value ? 'No hay fincas registradas.' : 'No hay fincas asignadas.'));

const emptyText = computed(() => {
  if (isFarmer.value) {
    return 'Cuando registres una finca, aparecerá en esta lista.';
  }

  return 'Cuando el administrador asigne fincas, aparecerán en esta lista.';
});

const visibleFarms = computed(() => {
  const assignedIds = currentUser.value?.assignedFarmIds ?? [];
  const normalizedSearch = search.value.trim().toLowerCase();

  return fincas.filter((finca) => {
    const isAssigned = assignedIds.includes(finca.id);
    const matchesSearch = finca.name.toLowerCase().includes(normalizedSearch);

    return isAssigned && matchesSearch;
  });
});
</script>

<style scoped>
.page-surface {
  --background: #f5f8fb;
}

.page-surface::part(scroll) {
  display: flex;
  justify-content: center;
}

.farm-shell {
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

.back-button ion-icon {
  font-size: 20px;
}

.page-title {
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

.info-note {
  margin: 8px 0 16px;
  padding: 11px 12px;
  border-left: 4px solid #2f75b5;
  border-radius: 8px;
  background: #d8e8f7;
  color: #052b66;
  font-size: 11px;
  font-weight: 800;
  line-height: 1.35;
}

.search-box {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  border-radius: 8px;
  background: #ffffff;
  color: #071832;
  border: 1px solid rgba(8, 37, 74, 0.1);
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

.farm-list {
  display: grid;
  gap: 12px;
  margin-top: 18px;
}

.farm-card {
  min-height: 72px;
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-radius: 10px;
  background: #052b66;
  color: #ffffff;
  box-shadow: 0 16px 26px rgba(8, 37, 74, 0.12);
}

.pin {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #d8e8f7;
  color: #052b66;
}

h2 {
  margin: 0;
  color: #ffffff;
  font-size: 13px;
  font-weight: 900;
}

.farm-card p {
  margin: 4px 0 0;
  color: #cfe0f5;
  font-size: 11px;
}

.farm-card a {
  min-height: 30px;
  display: inline-flex;
  align-items: center;
  padding: 0 12px;
  border-radius: 999px;
  background: #d8e8f7;
  color: #052b66;
  font-size: 11px;
  font-weight: 900;
  text-decoration: none;
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
.add-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 46px;
  margin-bottom: 14px;
  border: none;
  border-radius: 999px;
  background: #052b66;
  color: #ffffff;
  font-size: 13px;
  font-weight: 900;
  box-shadow: 0 14px 24px rgba(8, 37, 74, 0.18);
  cursor: pointer;
}

.add-button ion-icon {
  font-size: 18px;
}

.farm-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.icon-action {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 50%;
  background: #d8e8f7;
  color: #052b66;
  cursor: pointer;
}

.icon-action.danger {
  background: rgba(255, 255, 255, 0.18);
  color: #ffd7d3;
}

.icon-action ion-icon {
  font-size: 15px;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 16px;
  background: rgba(7, 24, 50, 0.45);
}

.modal-card {
  width: 100%;
  max-width: 390px;
  display: grid;
  gap: 12px;
  padding: 20px 18px 22px;
  border-radius: 16px 16px 10px 10px;
  background: #f5f8fb;
  box-shadow: 0 -10px 30px rgba(7, 24, 50, 0.25);
}

.modal-card h2 {
  margin: 0 0 4px;
  color: #08254a;
  font-size: 16px;
  font-weight: 900;
}

.modal-card label {
  display: grid;
  gap: 6px;
}

.modal-card label span {
  color: #08254a;
  font-size: 11px;
  font-weight: 900;
}

.modal-card input {
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  box-sizing: border-box;
  border: 1px solid #e4e8ef;
  border-radius: 8px;
  background: #ffffff;
  color: #071832;
  font-size: 13px;
  font-weight: 700;
}

.modal-error {
  margin: 0;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(217, 45, 32, 0.1);
  color: #b42318;
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
  background: #ffffff;
  color: #08254a;
}

.modal-save {
  border: none;
  background: #052b66;
  color: #ffffff;
}
</style>
