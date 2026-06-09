<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-title>Configuracion</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="page-surface">
      <section class="content">
        <h1>{{ currentUser?.fullName }}</h1>
        <p>{{ currentUser?.email }}</p>
        <span>{{ currentUser?.role }}</span>

        <ion-button expand="block" class="logout-button" @click="handleLogout">
          Cerrar sesion
        </ion-button>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { currentUser, logout } from '@/modules/auth/services/sessionService';

const router = useRouter();

const handleLogout = async () => {
  logout();
  await router.replace('/login');
};
</script>

<style scoped>
.page-surface {
  --background: #ffffff;
}

.content {
  padding: 28px 20px;
}

h1 {
  margin: 0 0 6px;
  color: #071832;
  font-size: 22px;
}

p {
  margin: 0 0 12px;
  color: #566071;
}

span {
  display: inline-flex;
  border-radius: 999px;
  background: #d8e7fb;
  color: #052b66;
  font-size: 12px;
  font-weight: 800;
  padding: 8px 12px;
  text-transform: capitalize;
}

.logout-button {
  --background: #052b66;
  --border-radius: 7px;
  margin-top: 28px;
  font-weight: 800;
}
</style>
