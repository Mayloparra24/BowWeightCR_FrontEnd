<template>
  <ion-page class="tabs-page">
    <ion-tabs>
      <ion-router-outlet />

      <ion-tab-bar slot="bottom">
        <ion-tab-button
          v-for="item in navItems"
          :key="item.href"
          :tab="item.tab"
          :href="item.href"
        >
          <ion-icon aria-hidden="true" :icon="item.icon" />
          <ion-label>{{ item.label }}</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonIcon,
  IonLabel,
  IonPage,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/vue';
import { computed } from 'vue';
import {
  businessOutline,
  cameraOutline,
  cogOutline,
  home,
  layersOutline,
  listOutline,
  personOutline,
} from 'ionicons/icons';
import { currentUser } from '@/modules/auth/services/sessionService';

const navItems = computed(() => {
  const role = currentUser.value?.role;

  if (role === 'admin') {
    return [
      { tab: 'inicio', href: '/app/inicio', label: 'Inicio', icon: home },
      { tab: 'usuarios', href: '/app/usuarios', label: 'Usuarios', icon: personOutline },
      { tab: 'bitacora', href: '/app/bitacora', label: 'Bitácora', icon: listOutline },
      { tab: 'configuracion', href: '/app/configuracion', label: 'Config.', icon: cogOutline },
    ];
  }

  if (role === 'veterinario') {
    return [
      { tab: 'inicio', href: '/app/inicio', label: 'Inicio', icon: home },
      { tab: 'fincas', href: '/app/fincas', label: 'Fincas', icon: layersOutline },
      { tab: 'configuracion', href: '/app/configuracion', label: 'Config.', icon: cogOutline },
    ];
  }

  if (role === 'asistente') {
    return [
      { tab: 'inicio', href: '/app/inicio', label: 'Inicio', icon: home },
      { tab: 'bovinos', href: '/app/bovinos', label: 'Buscar', icon: businessOutline },
      { tab: 'calcular-peso', href: '/app/calcular-peso', label: 'Foto', icon: cameraOutline },
      { tab: 'configuracion', href: '/app/configuracion', label: 'Config.', icon: cogOutline },
    ];
  }

  return [
    { tab: 'inicio', href: '/app/inicio', label: 'Inicio', icon: home },
    { tab: 'fincas', href: '/app/fincas', label: 'Fincas', icon: layersOutline },
    { tab: 'bovinos', href: '/app/bovinos', label: 'Bovinos', icon: businessOutline },
    { tab: 'configuracion', href: '/app/configuracion', label: 'Config.', icon: cogOutline },
  ];
});
</script>

<style scoped>
ion-tab-bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: calc(var(--bw-tab-bar-height) + var(--bw-safe-bottom));
  padding: 0 0 var(--bw-safe-bottom) 0;
  border-top: 1px solid rgba(8, 37, 74, 0.08);
  border-radius: 0;
  background: #ffffff;
  --background: #ffffff;
  box-shadow: 0 -2px 8px rgba(8, 37, 74, 0.04);
}

ion-tab-button {
  flex: 1 1 0;
  min-width: 0;
  --color: #8a93a3;
  --color-selected: #052b66;
  --background: transparent;
  --background-focused: transparent;
  --background-focused-opacity: 0;
  --padding-bottom: 5px;
  --padding-top: 4px;
  min-height: 48px;
  font-size: 9px;
  font-weight: 800;
}

ion-tab-button ion-icon {
  font-size: 19px;
}

ion-tab-button ion-label {
  margin-top: 1px;
}

@media (min-width: 700px) {
  .tabs-page {
    width: 430px;
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    background: #f5f8fb;
  }
}
</style>
