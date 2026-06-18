<template>
  <ion-page>
    <ion-content class="page-surface">
      <section class="content">
        <header class="page-header">
          <router-link class="back-button" to="/app/usuarios" aria-label="Volver a usuarios">
            <ion-icon :icon="chevronBackOutline" />
          </router-link>

          <h1>Detalle de usuario</h1>
        </header>

        <section v-if="user" class="profile-strip">
          <div class="avatar">{{ initials }}</div>
          <div>
            <h2>{{ user.fullName }}</h2>
            <p>{{ user.email }}</p>
            <span class="role-pill">{{ roleLabel(user.role) }}</span>
          </div>
        </section>

        <section v-if="user" class="detail-list" aria-label="Información del usuario">
          <article>
            <h3>Último inicio de sesión</h3>
            <p>Sin registros.</p>
          </article>

          <article>
            <h3>Cuenta creada</h3>
            <p>{{ fechaCreacion }}</p>
          </article>

          <article>
            <h3>Estado</h3>
            <span class="status-pill" :class="user.status">{{ user.status }}</span>
            <button class="status-action" type="button" :disabled="guardando" @click="toggleStatus">
              {{ user.status === 'activo' ? 'Desactivar cuenta' : 'Activar cuenta' }}
            </button>
            <p v-if="errorEstado" class="estado-error">{{ errorEstado }}</p>
          </article>

          <article>
            <h3>Contraseña</h3>
            <div class="password-reset-box">
              <input
                v-model="nuevaPassword"
                type="text"
                readonly
                placeholder="Generá una nueva contraseña"
              />
              <div class="password-actions">
                <button type="button" class="status-action" :disabled="guardandoPassword" @click="generarPassword">
                  Generar
                </button>
                <button type="button" class="status-action save" :disabled="!nuevaPassword || guardandoPassword" @click="guardarPassword">
                  Guardar
                </button>
              </div>
            </div>
            <p v-if="passwordSuccess" class="password-success">{{ passwordSuccess }}</p>
            <p v-if="passwordError" class="estado-error">{{ passwordError }}</p>
          </article>
        </section>

        <section v-else class="empty-state">
          <strong>Usuario no encontrado.</strong>
          <span>Selecciona un usuario registrado para ver su detalle.</span>
        </section>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonPage, onIonViewWillEnter } from '@ionic/vue';
import { chevronBackOutline } from 'ionicons/icons';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { usuariosRepo } from '@/shared/services/usuariosRepo';
import { formatFecha } from '@/shared/api/mappers';
import type { Rol, Usuario } from '@/shared/types/domain';

const route = useRoute();
const user = ref<Usuario | null>(null);
const guardando = ref(false);
const errorEstado = ref('');
const nuevaPassword = ref('');
const guardandoPassword = ref(false);
const passwordError = ref('');
const passwordSuccess = ref('');

const cargar = async () => {
  try {
    user.value = await usuariosRepo.get(String(route.params.id));
  } catch {
    user.value = null;
  }
};

onIonViewWillEnter(cargar);

const fechaCreacion = computed(() => formatFecha(user.value?.creadoEn) || 'Sin registro');

const initials = computed(() => {
  const name = user.value?.fullName ?? '';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
});

const roleLabel = (role: Rol) => {
  if (role === 'veterinario') return 'Veterinario';
  if (role === 'admin') return 'Admin';
  if (role === 'asistente') return 'Asistente';
  return 'Ganadero';
};

const toggleStatus = async () => {
  if (!user.value) return;
  guardando.value = true;
  errorEstado.value = '';
  try {
    const nuevoActivo = user.value.status !== 'activo';
    const actualizado = await usuariosRepo.update(user.value.id, { activo: nuevoActivo });
    user.value = actualizado;
  } catch (error) {
    errorEstado.value = error instanceof Error ? error.message : 'No fue posible cambiar el estado.';
  } finally {
    guardando.value = false;
  }
};

const generarPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < 10; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  nuevaPassword.value = result;
  passwordError.value = '';
  passwordSuccess.value = '';
};

const guardarPassword = async () => {
  if (!user.value || !nuevaPassword.value) return;
  guardandoPassword.value = true;
  passwordError.value = '';
  passwordSuccess.value = '';
  try {
    await usuariosRepo.update(user.value.id, { password: nuevaPassword.value });
    passwordSuccess.value = `Contraseña actualizada. Nueva clave: ${nuevaPassword.value}`;
    nuevaPassword.value = '';
  } catch (error) {
    passwordError.value = error instanceof Error ? error.message : 'No fue posible actualizar la contraseña.';
  } finally {
    guardandoPassword.value = false;
  }
};
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
  padding: var(--bw-page-pad-top) var(--bw-page-pad-x) var(--bw-page-pad-bottom-tabs);
  box-sizing: border-box;
}

.page-header {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 56px;
  border-bottom: 1px solid #e4e8ef;
  text-align: center;
}

.back-button {
  position: absolute;
  left: 0;
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

.profile-strip {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  margin: 28px -18px 0;
  padding: 22px 28px;
  background: #d9d9d9;
  color: #071832;
}

.avatar {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #052b66;
  color: #ffffff;
  font-size: 18px;
  font-weight: 900;
}

h2 {
  margin: 0;
  color: #071832;
  font-size: 15px;
  font-weight: 900;
}

.profile-strip p {
  margin: 2px 0 6px;
  color: #052b66;
  font-size: 11px;
  font-weight: 800;
}

.role-pill,
.status-pill,
.chip-row span {
  display: inline-flex;
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 10px;
  font-weight: 900;
}

.role-pill,
.chip-row span {
  background: #b7d8f0;
  color: #052b66;
}

.detail-list {
  display: grid;
  gap: 0;
}

.detail-list article {
  padding: 22px 0;
  border-bottom: 1px solid #6e83a6;
}

h3 {
  margin: 0 0 14px;
  color: #052b66;
  font-size: 13px;
  font-weight: 900;
}

.detail-list p {
  margin: 0;
  color: #052b66;
  font-size: 12px;
  font-weight: 700;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.status-pill.activo {
  background: #d8e8f7;
  color: #052b66;
  text-transform: capitalize;
}

.status-pill.inactivo {
  background: #ff7373;
  color: #571010;
  text-transform: capitalize;
}

.status-action {
  display: block;
  min-height: 36px;
  margin-top: 12px;
  border: 0;
  border-radius: 8px;
  background: #052b66;
  color: #ffffff;
  padding: 0 14px;
  font-size: 12px;
  font-weight: 900;
}

.status-action:disabled {
  opacity: 0.5;
}

.status-action.save {
  background: #2f75b5;
}

.estado-error {
  margin: 8px 0 0;
  color: #b42318;
  font-size: 11px;
  font-weight: 800;
}

.password-reset-box {
  display: grid;
  gap: 10px;
}

.password-reset-box input {
  width: 100%;
  min-height: 40px;
  padding: 10px 12px;
  box-sizing: border-box;
  border: 1px solid #e4e8ef;
  border-radius: 8px;
  background: #f5f8fb;
  color: #071832;
  font-size: 13px;
  font-weight: 700;
}

.password-actions {
  display: flex;
  gap: 10px;
}

.password-success {
  margin: 8px 0 0;
  color: #052b66;
  font-size: 11px;
  font-weight: 800;
}

.empty-state {
  min-height: 360px;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 8px;
  color: #566071;
  text-align: center;
}

.empty-state strong {
  color: #071832;
  font-size: 15px;
}

.empty-state span {
  max-width: 230px;
  font-size: 12px;
  line-height: 1.4;
}
</style>
