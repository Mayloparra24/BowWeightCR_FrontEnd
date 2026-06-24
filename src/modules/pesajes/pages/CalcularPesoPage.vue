<template>
  <ion-page>
    <ion-content class="page-surface">
      <section class="flow-shell">
        <header class="page-header">
          <button
            v-if="step !== 'exito'"
            class="back-button"
            type="button"
            aria-label="Volver"
            @click="goBack"
          >
            <ion-icon :icon="chevronBackOutline" />
          </button>

          <div>
            <h1>Calcular peso</h1>
            <p>{{ stepSubtitle }}</p>
          </div>
        </header>

        <p v-if="!isOnline && ['foto','existe','seleccion','registro'].includes(step)" class="offline-banner">
          La foto quedará en espera y se enviará cuando vuelva internet.
        </p>

        <!-- Paso 1: capturar fotografia -->
        <section v-if="step === 'foto'" class="photo-step">
          <div class="photo-frame" :class="{ filled: photoUrl }">
            <img v-if="photoUrl" :src="photoUrl" alt="Fotografía del bovino" />
            <div v-else class="photo-placeholder">
              <ion-icon :icon="cameraOutline" />
              <strong>Foto lateral del bovino</strong>
              <small>Captura el perfil completo del animal, sin obstáculos al frente.</small>
            </div>
          </div>

          <input
            ref="fileInput"
            class="file-input"
            type="file"
            accept="image/*"
            capture="environment"
            @change="onPhotoSelected"
          />
          <input
            ref="galleryInput"
            class="file-input"
            type="file"
            accept="image/*"
            @change="onPhotoSelected"
          />

          <div class="photo-actions">
            <button class="primary-button" type="button" @click="openCamera">
              <ion-icon :icon="cameraOutline" />
              {{ photoUrl ? 'Tomar otra foto' : 'Tomar foto' }}
            </button>
            <button class="secondary-button" type="button" @click="openGallery">
              <ion-icon :icon="imagesOutline" />
              {{ photoUrl ? 'Cambiar imagen' : 'Subir de galería' }}
            </button>
          </div>

          <p class="notice">
            El peso calculado es una estimación de apoyo y no reemplaza la báscula
            para transacciones comerciales.
          </p>

          <div class="actions">
            <router-link class="cancel-button" to="/app/inicio">Cancelar</router-link>
            <button class="next-button" type="button" :disabled="!photoUrl" @click="step = 'existe'">
              Continuar
            </button>
          </div>
        </section>

        <!-- Paso 2: el bovino existe? -->
        <section v-else-if="step === 'existe'" class="question-step">
          <div class="photo-thumb">
            <img :src="photoUrl" alt="Fotografía del bovino" />
          </div>

          <div class="question-card">
            <strong>¿El bovino ya está registrado?</strong>
            <small>Si existe, el pesaje se agrega a su historial.</small>
            <div class="question-actions">
              <button class="primary-button" type="button" @click="step = 'seleccion'">Sí</button>
              <button class="secondary-button" type="button" @click="step = 'registro'">No</button>
            </div>
          </div>
        </section>

        <!-- Paso 3a: seleccionar bovino existente -->
        <section v-else-if="step === 'seleccion'" class="form-step">
          <div class="photo-thumb compact">
            <img :src="photoUrl" alt="Fotografía del bovino" />
          </div>

          <label>
            <span>Seleccione el bovino</span>
            <select v-model="selectedBovinoId">
              <option value="" disabled>Elegir bovino...</option>
              <option v-for="item in bovinosDisponibles" :key="item.id" :value="item.id">
                {{ item.name }} - {{ farmName(item.farmId) }}
              </option>
            </select>
          </label>

          <p v-if="!bovinosDisponibles.length" class="empty-note">
            No hay bovinos activos en tus fincas. Regístralo como bovino nuevo.
          </p>

          <p v-if="formError" class="error-note">{{ formError }}</p>

          <div class="actions">
            <button class="cancel-button" type="button" @click="step = 'existe'">Atrás</button>
            <button
              class="next-button"
              type="button"
              :disabled="!selectedBovinoId"
              @click="calcularExistente"
            >
              Calcular peso
            </button>
          </div>
        </section>

        <!-- Paso 3b: registrar bovino nuevo -->
        <form v-else-if="step === 'registro'" class="form-step" @submit.prevent="calcularNuevo">
          <div class="field-grid">
            <label>
              <span>Nombre del bovino</span>
              <input v-model="nuevo.name" type="text" placeholder="Ej. El chirriche" />
            </label>

            <label>
              <span>Número de arete</span>
              <input v-model="nuevo.earTag" type="text" inputmode="numeric" placeholder="188012340056789" />
            </label>

            <label>
              <span>Selecciona la finca</span>
              <select v-model="nuevo.farmId">
                <option value="" disabled>Elegir finca...</option>
                <option v-for="farm in fincas" :key="farm.id" :value="farm.id">
                  {{ farm.name }}
                </option>
              </select>
            </label>

            <label>
              <span>Selecciona la raza</span>
              <select v-model="nuevo.breedId">
                <option value="" disabled>Elegir raza...</option>
                <option v-for="raza in razas" :key="raza.id" :value="raza.id">{{ raza.nombre }}</option>
              </select>
            </label>

            <label>
              <span>Sexo</span>
              <select v-model="nuevo.sex">
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
            </label>

            <label>
              <span>Fecha de nacimiento</span>
              <input v-model="nuevo.birthDate" type="date" :max="hoyIso" />
            </label>
          </div>

          <label>
            <span>Notas</span>
            <textarea v-model="nuevo.notes" rows="2" placeholder="Observaciones del animal (opcional)"></textarea>
          </label>

          <p v-if="formError" class="error-note">{{ formError }}</p>

          <div class="actions">
            <button class="cancel-button" type="button" @click="step = 'existe'">Atrás</button>
            <button class="next-button" type="submit" :aria-disabled="!formularioValido">Calcular peso</button>
          </div>
        </form>

        <!-- Procesando -->
        <section v-else-if="step === 'procesando'" class="processing-step">
          <div class="photo-thumb">
            <img :src="photoUrl" alt="Fotografía del bovino" />
          </div>
          <ion-spinner name="crescent" />
          <strong>Analizando la fotografía...</strong>
          <small>Estimando el peso con IA. Esto puede tardar unos segundos.</small>
        </section>

        <!-- Resultado -->
        <section v-else-if="step === 'resultado'" class="result-step">
          <div class="photo-thumb">
            <img :src="photoUrl" alt="Fotografía del bovino" />
          </div>

          <div class="result-card">
            <span>El peso estimado es</span>

            <strong v-if="!editandoPeso">{{ pesoEstimado }} <small>Kg</small></strong>
            <label v-else class="weight-edit">
              <input v-model.number="pesoCorregido" type="number" min="20" max="1500" />
              <small>Kg</small>
            </label>

            <p>{{ resultadoBovinoNombre }} - Confianza {{ confianzaTexto }}</p>

            <button class="link-button" type="button" @click="toggleEdicionPeso">
              {{ editandoPeso ? 'Usar peso estimado' : 'Corregir peso manualmente' }}
            </button>
          </div>

          <p class="notice">
            Estimación de apoyo. No reemplaza la báscula oficial para ventas.
          </p>

          <p v-if="formError" class="error-note">{{ formError }}</p>

          <div class="actions">
            <button class="cancel-button" type="button" @click="cancelarResultado">Cancelar</button>
            <button class="next-button" type="button" @click="guardar">Guardar</button>
          </div>
        </section>

        <!-- Exito -->
        <section v-else class="success-step">
          <div class="success-icon">
            <ion-icon :icon="checkmarkOutline" />
          </div>
          <h2>Pesaje guardado</h2>
          <p v-if="pendienteBackend">
            La fotografía de {{ resultadoBovinoNombre }} se recibió y se procesará
            cuando el microservicio de IA esté disponible.
          </p>
          <p v-else>
            Se registró un peso de {{ pesoGuardado }} Kg para {{ resultadoBovinoNombre }}
            en su historial.
          </p>
          <p v-if="offlineQueued" class="sync-note">
            Quedó pendiente de sincronización cuando vuelva internet.
          </p>

          <div class="success-actions">
            <router-link v-if="bovinoGuardadoId" class="primary-button" :to="`/app/bovinos/${bovinoGuardadoId}`">
              Ver perfil del bovino
            </router-link>
            <router-link class="secondary-button" to="/app/inicio">Volver al inicio</router-link>
          </div>
        </section>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonPage, IonSpinner, onIonViewWillEnter, onIonViewWillLeave } from '@ionic/vue';
import { cameraOutline, checkmarkOutline, chevronBackOutline, imagesOutline } from 'ionicons/icons';
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { bovinosRepo } from '@/shared/services/bovinosRepo';
import { fincasRepo } from '@/shared/services/fincasRepo';
import { razasRepo } from '@/shared/services/razasRepo';
import { pesajesRepo } from '@/shared/services/pesajesRepo';
import {
  enqueueEstimacion,
  isOnline,
  onOnline,
} from '@/shared/services/offlineService';
import { dataUrlToBlob } from '@/shared/utils/bovinoPhoto';
import type { Bovino, Finca, Raza } from '@/shared/types/domain';

type FlowStep = 'foto' | 'existe' | 'seleccion' | 'registro' | 'procesando' | 'resultado' | 'exito';

const router = useRouter();

const step = ref<FlowStep>('foto');
const fileInput = ref<HTMLInputElement | null>(null);
const galleryInput = ref<HTMLInputElement | null>(null);
const photoUrl = ref('');
const photoDataUrl = ref('');

const fincas = ref<Finca[]>([]);
const bovinos = ref<Bovino[]>([]);
const razas = ref<Raza[]>([]);

const selectedBovinoId = ref('');
const modoNuevo = ref(false);

const nuevo = reactive({
  name: '',
  earTag: '',
  farmId: '',
  breedId: '',
  sex: 'Macho' as Bovino['sex'],
  birthDate: '',
  notes: '',
});

const pesoEstimado = ref(0);
const confianza = ref(0);
const pesoCorregido = ref(0);
const editandoPeso = ref(false);
const pesoGuardado = ref(0);
const bovinoGuardadoId = ref('');
const formError = ref('');
const offlineQueued = ref(false);
const pendienteBackend = ref(false);
const pesajeId = ref('');

const bovinosDisponibles = computed(() => bovinos.value.filter((item) => item.status === 'Activo'));
const bovinoSeleccionado = computed(() => bovinos.value.find((item) => item.id === selectedBovinoId.value));

const hoyIso = new Date().toISOString().slice(0, 10);

let unsubOnline: (() => void) | null = null;

onIonViewWillEnter(async () => {
  try {
    const [f, b, r] = await Promise.all([fincasRepo.list(), bovinosRepo.list(), razasRepo.list()]);
    fincas.value = f;
    bovinos.value = b;
    razas.value = r;
  } catch (error) {
    formError.value = error instanceof Error ? error.message : 'No fue posible cargar los datos.';
  }
  unsubOnline = onOnline(refreshLists);
});

const refreshLists = async () => {
  const [f, b, r] = await Promise.all([fincasRepo.list(), bovinosRepo.list(), razasRepo.list()]);
  fincas.value = f;
  bovinos.value = b;
  razas.value = r;

  // Preserve-or-clear selection using bovinosDisponibles (filtered by status === 'Activo')
  const bovinosDisponiblesList = b.filter((item) => item.status === 'Activo');
  if (selectedBovinoId.value && !bovinosDisponiblesList.some((bv) => bv.id === selectedBovinoId.value)) {
    selectedBovinoId.value = '';
  }
  if (nuevo.farmId && !f.some((fa) => fa.id === nuevo.farmId)) {
    nuevo.farmId = '';
  }
  if (nuevo.breedId && !r.some((rz) => rz.id === nuevo.breedId)) {
    nuevo.breedId = '';
  }
};

const stepSubtitle = computed(() => {
  switch (step.value) {
    case 'foto': return 'Paso 1 - Fotografía del bovino';
    case 'existe': return 'Paso 2 - Identificar el bovino';
    case 'seleccion': return 'Paso 2 - Bovino existente';
    case 'registro': return 'Paso 2 - Registro de bovino';
    case 'procesando': return 'Procesando con IA';
    case 'resultado': return 'Paso 3 - Resultado de la estimación';
    default: return 'Pesaje registrado correctamente';
  }
});

const resultadoBovinoNombre = computed(() => {
  if (modoNuevo.value) return nuevo.name.trim() || 'Bovino nuevo';
  return bovinoSeleccionado.value?.name ?? 'Bovino';
});

const confianzaTexto = computed(() => `${Math.round(confianza.value * 100)}%`);

const formularioValido = computed(() => {
  return (
    nuevo.name.trim().length >= 2 &&
    nuevo.earTag.trim().length >= 6 &&
    nuevo.farmId !== '' &&
    nuevo.breedId !== '' &&
    nuevo.birthDate !== ''
  );
});

const validarRegistroNuevo = () => {
  if (nuevo.name.trim().length < 2) return 'Ingrese el nombre del bovino.';
  if (nuevo.earTag.trim().length < 6) return 'Ingrese un número de arete válido.';
  if (!nuevo.farmId) return 'Seleccione la finca del bovino.';
  if (!nuevo.breedId) return 'Seleccione la raza del bovino.';
  if (!nuevo.birthDate) return 'Seleccione la fecha de nacimiento.';
  return '';
};

const farmName = (farmId: string) => fincas.value.find((farm) => farm.id === farmId)?.name ?? 'Sin finca';

const openCamera = () => {
  if (fileInput.value) {
    fileInput.value.value = '';
    fileInput.value.click();
  }
};

const openGallery = () => {
  if (galleryInput.value) {
    galleryInput.value.value = '';
    galleryInput.value.click();
  }
};

const onPhotoSelected = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  if (photoUrl.value.startsWith('blob:')) URL.revokeObjectURL(photoUrl.value);

  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = typeof reader.result === 'string' ? reader.result : '';
    photoUrl.value = dataUrl;
    photoDataUrl.value = dataUrl;
  };
  reader.readAsDataURL(file);

  setTimeout(() => {
    if (fileInput.value) fileInput.value.value = '';
    if (galleryInput.value) galleryInput.value.value = '';
  }, 100);
};

onIonViewWillLeave(() => {
  if (photoUrl.value.startsWith('blob:')) URL.revokeObjectURL(photoUrl.value);
  photoUrl.value = '';
  photoDataUrl.value = '';
  step.value = 'foto';
  unsubOnline?.();
  unsubOnline = null;
});

const goBack = () => {
  formError.value = '';
  switch (step.value) {
    case 'foto': router.push('/app/inicio'); break;
    case 'existe': step.value = 'foto'; break;
    case 'seleccion':
    case 'registro': step.value = 'existe'; break;
    case 'resultado': step.value = modoNuevo.value ? 'registro' : 'seleccion'; break;
    default: break;
  }
};

const calcularExistente = async () => {
  formError.value = '';
  if (!bovinoSeleccionado.value) {
    formError.value = 'Seleccione un bovino válido.';
    return;
  }
  if (!bovinoSeleccionado.value.breedId) {
    formError.value = 'El bovino seleccionado no tiene raza registrada.';
    return;
  }
  if (!photoDataUrl.value) {
    formError.value = 'No se encontró la fotografía. Volvé a tomar la foto.';
    return;
  }
  if (bovinoSeleccionado.value.status !== 'Activo') {
    formError.value = 'El bovino seleccionado ya no está activo. No se puede estimar su peso.';
    return;
  }
  modoNuevo.value = false;
  step.value = 'procesando';

  if (!isOnline.value) {
    await enqueueEstimacion({
      bovinoId: bovinoSeleccionado.value.id,
      razaId: bovinoSeleccionado.value.breedId,
      bovinoNombre: bovinoSeleccionado.value.name,
      fotoDataUrl: photoDataUrl.value,
    });
    offlineQueued.value = true;
    pesoGuardado.value = 0;
    bovinoGuardadoId.value = bovinoSeleccionado.value.id;
    step.value = 'exito';
    return;
  }

  try {
    const foto = dataUrlToBlob(photoDataUrl.value);
    const resultado = await pesajesRepo.estimar({
      bovinoId: bovinoSeleccionado.value.id,
      razaId: bovinoSeleccionado.value.breedId,
      foto,
      modoOffline: false,
    });

    if (resultado.status === 'pendiente') {
      pendienteBackend.value = true;
      pesoGuardado.value = 0;
      bovinoGuardadoId.value = bovinoSeleccionado.value.id;
      step.value = 'exito';
      return;
    }
    pendienteBackend.value = false;
    pesajeId.value = resultado.pesaje.id;
    pesoEstimado.value = resultado.pesaje.weightKg;
    confianza.value = resultado.pesaje.confianzaIa ?? 0;
    pesoCorregido.value = resultado.pesaje.weightKg;
    editandoPeso.value = false;
    step.value = 'resultado';
  } catch (error) {
    formError.value = error instanceof Error ? error.message : 'No fue posible estimar el peso.';
    step.value = 'seleccion';
  }
};

const calcularNuevo = async () => {
  formError.value = '';
  modoNuevo.value = true;

  const validationError = validarRegistroNuevo();
  if (validationError) {
    formError.value = validationError;
    return;
  }

  if (!photoDataUrl.value) {
    formError.value = 'No se encontró la fotografía. Volvé a tomar la foto.';
    return;
  }

  if (!isOnline.value) {
    formError.value = 'Se requiere conexión para registrar un bovino nuevo.';
    return;
  }

  step.value = 'procesando';

  try {
    const bovino = await bovinosRepo.create({
      fincaId: nuevo.farmId,
      razaId: nuevo.breedId,
      earTag: nuevo.earTag.trim(),
      name: nuevo.name.trim(),
      sex: nuevo.sex,
      birthDate: nuevo.birthDate,
      notes: nuevo.notes.trim(),
    });

    const foto = dataUrlToBlob(photoDataUrl.value);
    const resultado = await pesajesRepo.estimar({
      bovinoId: bovino.id,
      razaId: nuevo.breedId,
      foto,
      modoOffline: false,
    });

    if (resultado.status === 'pendiente') {
      pendienteBackend.value = true;
      pesoGuardado.value = 0;
      bovinoGuardadoId.value = bovino.id;
      step.value = 'exito';
      return;
    }
    pendienteBackend.value = false;
    pesajeId.value = resultado.pesaje.id;
    pesoEstimado.value = resultado.pesaje.weightKg;
    confianza.value = resultado.pesaje.confianzaIa ?? 0;
    pesoCorregido.value = resultado.pesaje.weightKg;
    bovinoGuardadoId.value = bovino.id;
    editandoPeso.value = false;
    step.value = 'resultado';
  } catch (error) {
    formError.value = error instanceof Error ? error.message : 'No fue posible registrar el bovino.';
    step.value = 'registro';
  }
};

const toggleEdicionPeso = () => {
  editandoPeso.value = !editandoPeso.value;
  if (!editandoPeso.value) pesoCorregido.value = pesoEstimado.value;
};

const cancelarResultado = () => {
  formError.value = '';
  step.value = modoNuevo.value ? 'registro' : 'seleccion';
};

const guardar = async () => {
  formError.value = '';
  offlineQueued.value = false;

  if (pendienteBackend.value) {
    // El backend procesa la foto después; no hay pesaje que corregir aún.
    pesoGuardado.value = 0;
    step.value = 'exito';
    return;
  }

  const pesoFinal = editandoPeso.value ? Math.round(pesoCorregido.value) : pesoEstimado.value;

  if (!pesoFinal || pesoFinal < 20 || pesoFinal > 1500) {
    formError.value = 'Ingresa un peso dentro de un rango razonable (20 a 1500 Kg).';
    return;
  }

  try {
    if (editandoPeso.value && pesoFinal !== pesoEstimado.value && pesajeId.value) {
      await pesajesRepo.corregir(pesajeId.value, pesoFinal, 'Corrección manual del ganadero');
    }
    pesoGuardado.value = pesoFinal;
    step.value = 'exito';
  } catch (error) {
    formError.value = error instanceof Error ? error.message : 'No fue posible guardar el pesaje.';
    step.value = 'resultado';
  }
};
</script>

<style scoped>
.page-surface {
  --background: var(--bw-surface, #f5f8fb);
}

.page-surface::part(scroll) {
  display: block;
}

.flow-shell {
  width: 100%;
  max-width: 390px;
  min-height: 100%;
  margin: 0 auto;
  padding: var(--bw-page-pad-top) var(--bw-page-pad-x) var(--bw-page-pad-bottom-tabs);
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
  background: transparent;
  border: none;
  color: var(--bw-text, #071832);
}

.page-header h1 {
  margin: 0;
  color: var(--bw-text, #071832);
  font-size: 15px;
  font-weight: 900;
}

.page-header p {
  margin: 4px 0 0;
  color: var(--bw-text-secondary, #566071);
  font-size: 11px;
  font-weight: 800;
}

.photo-step,
.question-step,
.form-step,
.processing-step,
.result-step {
  display: grid;
  gap: 16px;
  margin-top: 6px;
}

.photo-frame {
  min-height: 250px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 1px dashed rgba(8, 37, 74, 0.25);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.7);
}

.photo-frame.filled {
  border-style: solid;
  border-color: rgba(8, 37, 74, 0.1);
  background: var(--bw-navy, #071832);
}

.photo-frame img {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.photo-placeholder {
  display: grid;
  justify-items: center;
  gap: 8px;
  padding: 24px;
  text-align: center;
}

.photo-placeholder ion-icon {
  font-size: 40px;
  color: var(--bw-accent, #2f75b5);
}

.photo-placeholder strong {
  color: var(--bw-header, #08254a);
  font-size: 14px;
  font-weight: 900;
}

.photo-placeholder small {
  color: var(--bw-text-secondary, #566071);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.4;
}

.file-input {
  display: none;
}

.photo-actions {
  display: grid;
  gap: 12px;
}

.primary-button,
.secondary-button {
  min-height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 18px;
  border: none;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 900;
  text-decoration: none;
  cursor: pointer;
}

.primary-button {
  background: var(--bw-primary, #052b66);
  color: var(--bw-white, #ffffff);
  box-shadow: 0 14px 24px rgba(8, 37, 74, 0.18);
}

.primary-button ion-icon {
  font-size: 18px;
}

.secondary-button {
  background: var(--bw-chip, #d8e8f7);
  color: var(--bw-primary, #052b66);
}

.notice {
  margin: 0;
  padding: 11px 12px;
  border-left: 4px solid var(--bw-accent, #2f75b5);
  border-radius: 8px;
  background: var(--bw-chip, #d8e8f7);
  color: var(--bw-primary, #052b66);
  font-size: 11px;
  font-weight: 800;
  line-height: 1.35;
}

.error-note {
  margin: 0;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(217, 45, 32, 0.1);
  color: var(--bw-error-text, #b42318);
  font-size: 11px;
  font-weight: 800;
}

.offline-banner,
.sync-note {
  margin: 0;
  padding: 10px 12px;
  border-radius: 8px;
  background: #fff4d6;
  color: #7a4b00;
  font-size: 11px;
  font-weight: 900;
  line-height: 1.35;
}

.sync-note {
  width: 100%;
  box-sizing: border-box;
}

.empty-note {
  margin: 0;
  padding: 16px;
  border: 1px dashed rgba(8, 37, 74, 0.18);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.7);
  color: var(--bw-text-secondary, #566071);
  font-size: 12px;
  font-weight: 800;
  text-align: center;
}

.actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 4px;
}

.cancel-button,
.next-button {
  min-height: 46px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 900;
  text-decoration: none;
  cursor: pointer;
}

.cancel-button {
  border: 1px solid rgba(8, 37, 74, 0.16);
  background: var(--bw-white, #ffffff);
  color: var(--bw-header, #08254a);
}

.next-button {
  border: none;
  background: var(--bw-primary, #052b66);
  color: var(--bw-white, #ffffff);
  box-shadow: 0 14px 24px rgba(8, 37, 74, 0.18);
}

.next-button:disabled {
  opacity: 0.45;
  box-shadow: none;
}

.next-button[aria-disabled='true'] {
  opacity: 0.72;
  box-shadow: none;
}

.photo-thumb {
  overflow: hidden;
  border-radius: 10px;
  border: 1px solid rgba(8, 37, 74, 0.08);
  box-shadow: 0 14px 24px rgba(8, 37, 74, 0.1);
}

.photo-thumb img {
  display: block;
  width: 100%;
  height: 210px;
  object-fit: cover;
}

.photo-thumb.compact img {
  height: 150px;
}

.question-card {
  display: grid;
  gap: 8px;
  padding: 18px;
  border-radius: 10px;
  background: var(--bw-white, #ffffff);
  border: 1px solid rgba(8, 37, 74, 0.08);
  box-shadow: 0 14px 24px rgba(8, 37, 74, 0.1);
  text-align: center;
}

.question-card strong {
  color: var(--bw-header, #08254a);
  font-size: 15px;
  font-weight: 900;
}

.question-card small {
  color: var(--bw-text-secondary, #566071);
  font-size: 11px;
  font-weight: 700;
}

.question-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 8px;
}

.form-step label {
  display: grid;
  gap: 6px;
}

.form-step label span {
  color: var(--bw-header, #08254a);
  font-size: 11px;
  font-weight: 900;
}

.form-step input,
.form-step select,
.form-step textarea {
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  box-sizing: border-box;
  border: 1px solid var(--bw-border, #e4e8ef);
  border-radius: 8px;
  background: var(--bw-white, #ffffff);
  color: var(--bw-text, #071832);
  font-size: 13px;
  font-weight: 700;
}

.form-step textarea {
  resize: none;
}

.form-step input:focus,
.form-step select:focus,
.form-step textarea:focus {
  outline: 2px solid var(--bw-accent, #2f75b5);
  outline-offset: 1px;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.field-grid label:nth-child(-n + 2) {
  grid-column: span 2;
}

.processing-step {
  justify-items: center;
  gap: 12px;
  text-align: center;
}

.processing-step ion-spinner {
  width: 42px;
  height: 42px;
  margin-top: 10px;
  color: var(--bw-primary, #052b66);
}

.processing-step strong {
  color: var(--bw-header, #08254a);
  font-size: 14px;
  font-weight: 900;
}

.processing-step small {
  color: var(--bw-text-secondary, #566071);
  font-size: 11px;
  font-weight: 700;
}

.result-card {
  display: grid;
  justify-items: center;
  gap: 6px;
  padding: 22px 18px;
  border-radius: 10px;
  background: var(--bw-primary, #052b66);
  color: var(--bw-white, #ffffff);
  box-shadow: 0 18px 30px rgba(8, 37, 74, 0.18);
  text-align: center;
}

.result-card > span {
  border-radius: 999px;
  padding: 6px 12px;
  background: var(--bw-chip, #d8e8f7);
  color: var(--bw-primary, #052b66);
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
}

.result-card strong {
  font-size: 40px;
  font-weight: 900;
  line-height: 1.1;
}

.result-card strong small {
  font-size: 16px;
}

.result-card p {
  margin: 0;
  color: var(--bw-sky-soft, #cfe0f5);
  font-size: 11px;
  font-weight: 800;
}

.weight-edit {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
}

.weight-edit input {
  width: 120px;
  padding: 8px 10px;
  border: none;
  border-radius: 8px;
  background: var(--bw-white, #ffffff);
  color: var(--bw-primary, #052b66);
  font-size: 26px;
  font-weight: 900;
  text-align: center;
}

.weight-edit small {
  color: var(--bw-sky-soft, #cfe0f5);
  font-size: 14px;
  font-weight: 900;
}

.link-button {
  margin-top: 6px;
  border: none;
  background: transparent;
  color: var(--bw-sky, #8bb7e5);
  font-size: 11px;
  font-weight: 900;
  text-decoration: underline;
  cursor: pointer;
}

.success-step {
  display: grid;
  justify-items: center;
  gap: 10px;
  margin-top: 26px;
  text-align: center;
}

.success-icon {
  width: 72px;
  height: 72px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--bw-chip, #d8e8f7);
  color: var(--bw-primary, #052b66);
}

.success-icon ion-icon {
  font-size: 34px;
}

.success-step h2 {
  margin: 6px 0 0;
  color: var(--bw-header, #08254a);
  font-size: 18px;
  font-weight: 900;
}

.success-step p {
  margin: 0;
  color: var(--bw-text-secondary, #566071);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.45;
}

.success-actions {
  width: 100%;
  display: grid;
  gap: 12px;
  margin-top: 14px;
}
</style>
