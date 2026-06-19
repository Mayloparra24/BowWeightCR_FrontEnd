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
            <p>{{ bovinosVisibles.length }} {{ bovinosVisibles.length === 1 ? 'disponible' : 'disponibles' }}</p>
          </div>

          <div class="header-actions">
            <button
              type="button"
              aria-label="Compartir reporte"
              :disabled="!bovinosVisibles.length"
              @click="compartirReporte"
            >
              <ion-icon :icon="documentTextOutline" />
            </button>
            <button
              type="button"
              aria-label="Exportar inventario"
              :disabled="!bovinosVisibles.length"
              @click="exportarInventario"
            >
              <ion-icon :icon="downloadOutline" />
            </button>
          </div>
        </header>

        <button v-if="canCreateBovino" type="button" class="add-button" @click="abrirCrear">
          <ion-icon :icon="addOutline" />
          Agregar bovino
        </button>

        <label class="search-box">
          <ion-icon :icon="searchOutline" />
          <input v-model="search" type="search" placeholder="Buscar por nombre o arete..." />
        </label>

        <label v-if="fincas.length > 1" class="filter-field">
          <span>Finca</span>
          <select v-model="selectedFarmId">
            <option value="">{{ farmFilterLabel }}</option>
            <option v-for="finca in fincas" :key="finca.id" :value="finca.id">
              {{ finca.name }}
            </option>
          </select>
        </label>

        <div class="status-filter" aria-label="Filtro por estado del bovino">
          <button
            v-for="option in statusOptions"
            :key="option.value"
            type="button"
            :class="{ active: statusFilter === option.value }"
            @click="statusFilter = option.value"
          >
            {{ option.label }}
          </button>
        </div>

        <div v-if="bovinosVisibles.length" class="animal-list">
          <BovinoListItem v-for="bovino in bovinosVisibles" :key="bovino.id" :bovino="bovino" />
        </div>

        <section v-else class="empty-state">
          <strong>No hay bovinos disponibles.</strong>
          <span>{{ emptyStateMessage }}</span>
        </section>
      </section>

      <div v-if="modalAbierto" class="modal-backdrop" @click.self="cerrarCrear">
        <form class="modal-card" @submit.prevent="guardarBovino">
          <h2>Agregar bovino</h2>

          <label>
            <span>Nombre del bovino</span>
            <input v-model="form.name" type="text" placeholder="Ej. Churrita" />
          </label>

          <label>
            <span>Numero de arete</span>
            <input v-model="form.earTag" type="text" inputmode="numeric" placeholder="188012340056789" />
          </label>

          <label>
            <span>Finca</span>
            <select v-model="form.farmId">
              <option value="" disabled>Elegir finca...</option>
              <option v-for="finca in fincas" :key="finca.id" :value="finca.id">
                {{ finca.name }}
              </option>
            </select>
          </label>

          <label>
            <span>Raza</span>
            <select v-model="form.breedId">
              <option value="" disabled>Elegir raza...</option>
              <option v-for="raza in razas" :key="raza.id" :value="raza.id">
                {{ raza.nombre }}
              </option>
            </select>
          </label>

          <div class="field-row">
            <label>
              <span>Sexo</span>
              <select v-model="form.sex">
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
            </label>

            <label>
              <span>Fecha nacimiento</span>
              <input v-model="form.birthDate" type="date" :max="hoyIso" />
            </label>
          </div>

          <label>
            <span>Observaciones</span>
            <textarea v-model="form.notes" rows="2" placeholder="Notas opcionales"></textarea>
          </label>

          <p v-if="formError" class="modal-error">{{ formError }}</p>

          <div class="modal-actions">
            <button type="button" class="modal-cancel" :disabled="guardando" @click="cerrarCrear">Cancelar</button>
            <button type="submit" class="modal-save" :disabled="guardando">
              {{ guardando ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonPage, onIonViewWillEnter } from '@ionic/vue';
import { addOutline, chevronBackOutline, documentTextOutline, downloadOutline, searchOutline } from 'ionicons/icons';
import { computed, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { currentUser } from '@/modules/auth/services/sessionService';
import { bovinosRepo } from '@/shared/services/bovinosRepo';
import { fincasRepo } from '@/shared/services/fincasRepo';
import { razasRepo } from '@/shared/services/razasRepo';
import BovinoListItem from '@/shared/components/BovinoListItem.vue';
import { exportInventarioCsv, shareInventarioPdf } from '@/shared/services/reportService';
import type { Bovino, EstadoBovino, Finca, Raza } from '@/shared/types/domain';

const search = ref('');
const route = useRoute();

const bovinos = ref<Bovino[]>([]);
const fincas = ref<Finca[]>([]);
const razas = ref<Raza[]>([]);
const selectedFarmId = ref(typeof route.query.finca === 'string' ? route.query.finca : '');
const statusFilter = ref<'activos' | 'inactivos' | 'todos'>('activos');
const modalAbierto = ref(false);
const guardando = ref(false);
const formError = ref('');
const hoyIso = new Date().toISOString().slice(0, 10);

const form = reactive({
  name: '',
  earTag: '',
  farmId: '',
  breedId: '',
  sex: 'Macho' as Bovino['sex'],
  birthDate: '',
  notes: '',
});

const statusOptions = [
  { value: 'activos', label: 'Activos' },
  { value: 'inactivos', label: 'Inactivos' },
  { value: 'todos', label: 'Todos' },
] as const;

const canCreateBovino = computed(() => {
  const role = currentUser.value?.role;
  return role === 'ganadero';
});

const isVet = computed(() => currentUser.value?.role === 'veterinario');
const isAssistant = computed(() => currentUser.value?.role === 'asistente');

const farmFilterLabel = computed(() =>
  isVet.value || isAssistant.value ? 'Todas las fincas asignadas' : 'Todas mis fincas',
);

const emptyStateMessage = computed(() =>
  isVet.value
    ? 'Cuando tengas bovinos asignados por tus clientes, apareceran aqui.'
    : isAssistant.value
      ? 'Aun no tienes bovinos asignados. Cuando te asignen fincas con bovinos, apareceran aqui.'
      : 'Cuando registres bovinos en tus fincas, apareceran aqui.',
);

onIonViewWillEnter(async () => {
  try {
    const [b, f, r] = await Promise.all([bovinosRepo.list(), fincasRepo.list(), razasRepo.list()]);
    bovinos.value = b;
    fincas.value = f;
    razas.value = r;
  } catch {
    search.value = '';
    bovinos.value = [];
    fincas.value = [];
    razas.value = [];
  }
});

const bovinosVisibles = computed(() => {
  const normalizedSearch = search.value.trim().toLowerCase();

  return bovinos.value.filter((bovino) => {
    const matchesFarm = !selectedFarmId.value || bovino.farmId === selectedFarmId.value;
    const matchesStatus = matchesStatusFilter(bovino.status);
    const matchesSearch =
      bovino.name.toLowerCase().includes(normalizedSearch) ||
      bovino.earTag.toLowerCase().includes(normalizedSearch);
    return matchesFarm && matchesStatus && matchesSearch;
  });
});

const matchesStatusFilter = (status: EstadoBovino) => {
  if (statusFilter.value === 'todos') return true;
  if (statusFilter.value === 'activos') return status === 'Activo';
  return status !== 'Activo';
};

const reportTitle = computed(() => {
  if (selectedFarmId.value) {
    return fincas.value.find((finca) => finca.id === selectedFarmId.value)?.name ?? 'Inventario';
  }
  return fincas.value.length ? fincas.value.map((finca) => finca.name).join(' - ') : 'Inventario';
});

const exportarInventario = () => {
  exportInventarioCsv(bovinosVisibles.value, fincas.value);
};

const compartirReporte = async () => {
  await shareInventarioPdf(bovinosVisibles.value, fincas.value, reportTitle.value);
};

const abrirCrear = () => {
  form.name = '';
  form.earTag = '';
  form.farmId = selectedFarmId.value || fincas.value[0]?.id || '';
  form.breedId = razas.value[0]?.id || '';
  form.sex = 'Macho';
  form.birthDate = '';
  form.notes = '';
  formError.value = '';
  modalAbierto.value = true;
};

const cerrarCrear = () => {
  if (guardando.value) return;
  modalAbierto.value = false;
  formError.value = '';
};

const validarForm = () => {
  if (form.name.trim().length < 2) return 'Ingrese el nombre del bovino.';
  if (form.earTag.trim().length < 6) return 'Ingrese un numero de arete valido.';
  if (!form.farmId) return 'Seleccione la finca del bovino.';
  if (!form.breedId) return 'Seleccione la raza del bovino.';
  if (!form.birthDate) return 'Seleccione la fecha de nacimiento.';
  return '';
};

const guardarBovino = async () => {
  formError.value = '';
  const validationError = validarForm();
  if (validationError) {
    formError.value = validationError;
    return;
  }

  guardando.value = true;
  try {
    await bovinosRepo.create({
      fincaId: form.farmId,
      razaId: form.breedId,
      earTag: form.earTag.trim(),
      name: form.name.trim(),
      sex: form.sex,
      birthDate: form.birthDate,
      notes: form.notes.trim(),
    });
    const [b, f] = await Promise.all([bovinosRepo.list(), fincasRepo.list()]);
    bovinos.value = b;
    fincas.value = f;
    selectedFarmId.value = form.farmId;
    statusFilter.value = 'activos';
    modalAbierto.value = false;
  } catch (error) {
    formError.value = error instanceof Error ? error.message : 'No fue posible guardar el bovino.';
  } finally {
    guardando.value = false;
  }
};
</script>

<style scoped>
.page-surface {
  --background: #f5f8fb;
  --padding-bottom: var(--bw-page-pad-bottom-tabs);
}

.page-surface::part(scroll) {
  display: block;
}

.animal-shell {
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

.header-actions {
  position: absolute;
  right: 0;
  top: 19px;
  display: inline-flex;
  gap: 8px;
}

.header-actions button {
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

.header-actions button:disabled {
  opacity: 0.4;
}

.header-actions ion-icon {
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

.add-button {
  width: 100%;
  min-height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 14px;
  border: none;
  border-radius: 999px;
  background: #052b66;
  color: #ffffff;
  font-size: 13px;
  font-weight: 900;
  box-shadow: 0 14px 24px rgba(8, 37, 74, 0.18);
}

.add-button ion-icon {
  font-size: 18px;
}

.search-box,
.filter-field select {
  min-height: 44px;
  border: 1px solid rgba(8, 37, 74, 0.1);
  border-radius: 8px;
  background: #ffffff;
  color: #071832;
  box-shadow: 0 12px 24px rgba(8, 37, 74, 0.06);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
}

.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #071832;
  font-size: 13px;
}

.filter-field {
  display: grid;
  gap: 6px;
  margin-top: 12px;
}

.filter-field span {
  color: #08254a;
  font-size: 11px;
  font-weight: 900;
}

.filter-field select {
  width: 100%;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 800;
}

.status-filter {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 12px;
}

.status-filter button {
  min-height: 36px;
  border: 1px solid rgba(8, 37, 74, 0.1);
  border-radius: 999px;
  background: #ffffff;
  color: #052b66;
  font-size: 11px;
  font-weight: 900;
}

.status-filter button.active {
  background: #052b66;
  color: #ffffff;
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
  max-height: calc(100vh - 120px);
  overflow-y: auto;
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

.modal-card input,
.modal-card select,
.modal-card textarea {
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

.modal-card textarea {
  resize: none;
}

.field-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
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

.modal-save:disabled,
.modal-cancel:disabled {
  opacity: 0.65;
}
</style>
