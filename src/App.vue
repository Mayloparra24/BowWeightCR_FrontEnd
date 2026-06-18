<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { StatusBar } from '@capacitor/status-bar';
import { onMounted } from 'vue';

onMounted(async () => {
  try {
    await StatusBar.setOverlaysWebView({ overlay: true });
    await StatusBar.setBackgroundColor({ color: '#052b66' });
  } catch {
    // Web / preview: StatusBar no disponible
  }
});
</script>
