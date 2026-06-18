<template>
  <ion-page>
    <ion-content class="page-surface">
      <section class="content">
        <header class="page-header">
          <router-link class="back-button" to="/app/inicio" aria-label="Volver al inicio">
            <ion-icon :icon="chevronBackOutline" />
          </router-link>

          <h1>Configuración</h1>
        </header>

        <article class="profile-card">
          <div class="avatar" aria-hidden="true">
            {{ initials }}
          </div>

          <div class="profile-copy">
            <h2>{{ currentUser?.fullName }}</h2>
            <p>{{ currentUser?.email }}</p>
            <span>{{ currentUser?.role }}</span>
          </div>
        </article>

        <ion-button expand="block" class="logout-button" @click="handleLogout">
          Cerrar sesión
        </ion-button>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButton, IonContent, IonIcon, IonPage } from '@ionic/vue';
import { chevronBackOutline } from 'ionicons/icons';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { currentUser, logout } from '@/modules/auth/services/sessionService';

const router = useRouter();
const initials = computed(() => {
  const name = currentUser.value?.fullName ?? 'Usuario';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
});

const handleLogout = async () => {
  await logout();
  await router.replace('/login');
};
</script>

<style scoped>
.page-surface {
  --background: #f5f8fb;
}

.content {
  width: 100%;
  max-width: 390px;
  min-height: 100%;
  display: flex;
  flex-direction: column;
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

.profile-card {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  padding: 18px;
  border: 1px solid rgba(5, 43, 102, 0.08);
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 14px 30px rgba(7, 24, 50, 0.08);
}

.avatar {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #052b66;
  color: #ffffff;
  font-size: 18px;
  font-weight: 900;
}

.profile-copy {
  min-width: 0;
}

h2 {
  margin: 0 0 6px;
  color: #071832;
  font-size: 20px;
  font-weight: 900;
}

p {
  margin: 0 0 12px;
  color: #566071;
  font-size: 14px;
  overflow-wrap: anywhere;
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
  --background-activated: #071832;
  --background-focused: #071832;
  --background-hover: #071832;
  --border-radius: 8px;
  --box-shadow: 0 12px 22px rgba(5, 43, 102, 0.18);
  min-height: 46px;
  margin-top: 24px;
  font-weight: 900;
  text-transform: uppercase;
}
</style>
