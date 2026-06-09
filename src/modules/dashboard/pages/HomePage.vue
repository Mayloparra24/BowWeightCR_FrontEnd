<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-title>Inicio</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="page-surface">
      <section class="home-content">
        <p class="eyebrow">{{ roleLabel }}</p>
        <h1>Hola, {{ userName }}</h1>
        <p class="support-copy">
          BovWeight CR muestra estimaciones referenciales y no sustituye una bascula oficial.
        </p>

        <div class="quick-grid">
          <router-link class="quick-card" to="/app/fincas">
            <strong>Fincas</strong>
            <span>Ver accesos y animales por finca</span>
          </router-link>
          <router-link class="quick-card" to="/app/bovinos">
            <strong>Bovinos</strong>
            <span>Consultar peso e historial</span>
          </router-link>
          <router-link v-if="isAdmin" class="quick-card" to="/app/usuarios">
            <strong>Usuarios</strong>
            <span>Gestionar roles y accesos</span>
          </router-link>
          <router-link v-if="isAdmin" class="quick-card" to="/app/bitacora">
            <strong>Bitacora</strong>
            <span>Revisar eventos del sistema</span>
          </router-link>
        </div>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { computed } from 'vue';
import { currentUser } from '@/modules/auth/services/sessionService';

const userName = computed(() => currentUser.value?.fullName ?? 'Usuario');
const isAdmin = computed(() => currentUser.value?.role === 'admin');
const roleLabel = computed(() => {
  const role = currentUser.value?.role;

  if (role === 'admin') {
    return 'Administrador del sistema';
  }

  if (role === 'veterinario') {
    return 'Veterinario';
  }

  return 'Ganadero';
});
</script>

<style scoped>
.page-surface {
  --background: #ffffff;
}

.home-content {
  padding: 28px 22px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #2f75b5;
  font-size: 13px;
  font-weight: 800;
}

h1 {
  margin: 0 0 8px;
  color: #071832;
  font-size: 26px;
  font-weight: 800;
}

.support-copy {
  margin: 0 0 22px;
  color: #566071;
  line-height: 1.45;
}

.quick-grid {
  display: grid;
  gap: 12px;
}

.quick-card {
  display: grid;
  gap: 6px;
  min-height: 86px;
  padding: 16px;
  border-radius: 8px;
  background: #082b65;
  color: #ffffff;
  text-decoration: none;
}

.quick-card span {
  color: #cfe0f5;
  font-size: 13px;
}
</style>
