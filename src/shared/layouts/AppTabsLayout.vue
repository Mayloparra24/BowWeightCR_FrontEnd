<template>
  <ion-page>
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
import { businessOutline, cogOutline, home, layersOutline, listOutline, personOutline } from 'ionicons/icons';
import { currentUser } from '@/modules/auth/services/sessionService';

const navItems = computed(() => {
  const role = currentUser.value?.role;

  if (role === 'admin') {
    return [
      { tab: 'inicio', href: '/app/inicio', label: 'Inicio', icon: home },
      { tab: 'usuarios', href: '/app/usuarios', label: 'Usuarios', icon: personOutline },
      { tab: 'bitacora', href: '/app/bitacora', label: 'Bitacora', icon: listOutline },
      { tab: 'configuracion', href: '/app/configuracion', label: 'Configuracion', icon: cogOutline },
    ];
  }

  return [
    { tab: 'inicio', href: '/app/inicio', label: 'Inicio', icon: home },
    { tab: 'fincas', href: '/app/fincas', label: 'Fincas', icon: layersOutline },
    { tab: 'bovinos', href: '/app/bovinos', label: 'Bovinos', icon: businessOutline },
    { tab: 'configuracion', href: '/app/configuracion', label: 'Configuracion', icon: cogOutline },
  ];
});
</script>
