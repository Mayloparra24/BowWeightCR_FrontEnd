<template>
  <ion-page>
    <ion-content class="page-surface">
      <section class="assign-shell">
        <header class="page-header">
          <router-link class="back-button" to="/app/fincas" aria-label="Volver a fincas">
            <ion-icon :icon="chevronBackOutline" />
          </router-link>
          <div>
            <h1>Usuarios de {{ farmName }}</h1>
            <p>Asigná o quitá veterinarios y asistentes</p>
          </div>
        </header>

        <div class="role-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            type="button"
            :class="{ active: activeTab === tab.value }"
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>

        <p v-if="error" class="error-note">{{ error }}</p>

        <div class="assigned-list">
          <article v-for="item in assignedList" :key="item.id" class="user-row">
            <div class="user-info">
              <strong>{{ item.usuario?.nombre_completo ?? 'Usuario' }}</strong>
              <small>{{ item.usuario?.correo_electronico }}</small>
            </div>
            <button type="button" class="remove-btn" :disabled="cargando" @click="quitar(item.id)">
              Quitar
            </button>
          </article>
          <p v-if="!assignedList.length" class="empty-note">No hay usuarios asignados con este rol.</p>
        </div>

        <button type="button" class="add-button" @click="abrirAgregar">
          <ion-icon :icon="addOutline" />
          Agregar {{ activeTab === 'veterinario' ? 'veterinario' : 'asistente' }}
        </button>

        <div v-if="modalAbierto" class="modal-backdrop" @click.self="cerrarAgregar">
          <div class="modal-card">
            <h2>Agregar {{ activeTab === 'veterinario' ? 'veterinario' : 'asistente' }}</h2>
            <p v-if="!disponibles.length" class="empty-note">No hay usuarios disponibles de este rol.</p>
            <label v-else>
              <span>Seleccioná un usuario</span>
              <select v-model="selectedUserId">
                <option value="" disabled>Elegir...</option>
                <option v-for="u in disponibles" :key="u.id" :value="String(u.id)">
                  {{ u.nombre_completo }} - {{ u.correo_electronico }}
                </option>
              </select>
            </label>
            <p v-if="modalError" class="modal-error">{{ modalError }}</p>
            <div class="modal-actions">
              <button type="button" class="modal-cancel" @click="cerrarAgregar">Cancelar</button>
              <button type="button" class="modal-save" :disabled="!selectedUserId || cargando" @click="agregar">
                {{ cargando ? 'Asignando...' : 'Asignar' }}
              </button>
            </div>
          </div>
        </div>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonPage, onIonViewWillEnter } from '@ionic/vue';
import { addOutline, chevronBackOutline } from 'ionicons/icons';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { fincasRepo } from '@/shared/services/fincasRepo';
import { usuariosRepo } from '@/shared/services/usuariosRepo';
import type { Finca } from '@/shared/types/domain';

const route = useRoute();

const farmId = String(route.params.id);
const farmName = ref('');
const cargando = ref(false);
const error = ref('');
const modalAbierto = ref(false);
const modalError = ref('');
const selectedUserId = ref('');

interface AsignacionItem {
  id: number;
  usuario: { id: number; nombre_completo: string; correo_electronico: string } | null;
  esta_activa: boolean;
  rol: string;
}

const asignaciones = ref<AsignacionItem[]>([]);
const disponibles = ref<{ id: number; nombre_completo: string; correo_electronico: string }[]>([]);

const tabs = [
  { value: 'veterinario', label: 'Veterinarios' },
  { value: 'asistente', label: 'Asistentes' },
] as const;

const activeTab = ref<'veterinario' | 'asistente'>('veterinario');

const assignedList = computed(() =>
  asignaciones.value.filter((a) => a.rol === activeTab.value && a.esta_activa),
);

const cargar = async () => {
  cargando.value = true;
  error.value = '';
  try {
    const farm: Finca = await fincasRepo.get(farmId);
    farmName.value = farm.name;

    const [vets, asis] = await Promise.all([
      fincasRepo.listAsignaciones(farmId, 'veterinario'),
      fincasRepo.listAsignaciones(farmId, 'asistente'),
    ]);
    asignaciones.value = [...vets, ...asis];
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se pudieron cargar los datos.';
  } finally {
    cargando.value = false;
  }
};

onIonViewWillEnter(cargar);

const abrirAgregar = async () => {
  modalError.value = '';
  selectedUserId.value = '';
  modalAbierto.value = true;
  try {
    disponibles.value = await usuariosRepo.disponiblesPorRol(activeTab.value);
  } catch {
    disponibles.value = [];
    modalError.value = 'No se pudieron cargar los usuarios disponibles.';
  }
};

const cerrarAgregar = () => {
  modalAbierto.value = false;
  modalError.value = '';
};

const agregar = async () => {
  if (!selectedUserId.value) return;
  cargando.value = true;
  modalError.value = '';
  try {
    await fincasRepo.asignarUsuario(farmId, activeTab.value, selectedUserId.value);
    modalAbierto.value = false;
    await cargar();
  } catch (e) {
    modalError.value = e instanceof Error ? e.message : 'No se pudo asignar el usuario.';
  } finally {
    cargando.value = false;
  }
};

const quitar = async (asignacionId: number) => {
  cargando.value = true;
  error.value = '';
  try {
    await fincasRepo.removerAsignacion(farmId, asignacionId);
    await cargar();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se pudo quitar el usuario.';
  } finally {
    cargando.value = false;
  }
};
</script>

<style scoped>
.page-surface {
  --background: #f5f8fb;
  --padding-bottom: var(--bw-page-pad-bottom-tabs);
}

.assign-shell {
  width: 100%;
  max-width: 390px;
  min-height: 100%;
  margin: 0 auto;
  padding: var(--bw-page-pad-top) var(--bw-page-pad-x) 24px;
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

.page-header p {
  margin: 4px 0 0;
  color: #566071;
  font-size: 11px;
  font-weight: 800;
}

.role-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 16px;
}

.role-tabs button {
  min-height: 36px;
  border: 1px solid rgba(8, 37, 74, 0.1);
  border-radius: 999px;
  background: #ffffff;
  color: #052b66;
  font-size: 11px;
  font-weight: 900;
  cursor: pointer;
}

.role-tabs button.active {
  background: #052b66;
  color: #ffffff;
}

.error-note {
  margin: 12px 0;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(217, 45, 32, 0.1);
  color: #b42318;
  font-size: 11px;
  font-weight: 800;
}

.assigned-list {
  display: grid;
  gap: 10px;
  margin-top: 16px;
}

.user-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: 10px;
  background: #ffffff;
  border: 1px solid rgba(8, 37, 74, 0.08);
}

.user-info {
  display: grid;
  gap: 2px;
}

.user-info strong {
  color: #071832;
  font-size: 13px;
  font-weight: 900;
}

.user-info small {
  color: #566071;
  font-size: 11px;
  font-weight: 700;
}

.remove-btn {
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid rgba(217, 45, 32, 0.2);
  border-radius: 999px;
  background: #ffffff;
  color: #b42318;
  font-size: 10px;
  font-weight: 900;
  cursor: pointer;
}

.remove-btn:disabled {
  opacity: 0.5;
}

.add-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 46px;
  margin-top: 16px;
  border: none;
  border-radius: 999px;
  background: #052b66;
  color: #ffffff;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
}

.add-button ion-icon {
  font-size: 18px;
}

.empty-note {
  margin: 0;
  padding: 22px;
  text-align: center;
  color: #566071;
  font-size: 12px;
  font-weight: 800;
  border: 1px dashed rgba(8, 37, 74, 0.18);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.7);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 16px 16px calc(var(--bw-tabbar-height, 76px) + var(--bw-safe-bottom) + 18px);
  background: rgba(7, 24, 50, 0.45);
}

.modal-card {
  width: 100%;
  max-width: 390px;
  display: grid;
  gap: 12px;
  padding: 20px 18px 18px;
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

.modal-card select {
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

.modal-save:disabled {
  opacity: 0.65;
}
</style>
