<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-title>Bitacora de actividad</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="page-surface">
      <section class="content">
        <p class="subtitle">Registro completo del sistema</p>

        <div class="filter-row">
          <button
            v-for="option in filters"
            :key="option"
            :class="{ active: selectedFilter === option }"
            type="button"
            @click="selectedFilter = option"
          >
            {{ option }}
          </button>
        </div>

        <div class="log-panel">
          <article v-for="event in visibleEvents" :key="event.id" class="log-row">
            <span>{{ event.message }}</span>
            <time>{{ event.date }}</time>
          </article>
        </div>

        <p class="notice">Mostrando ultimos 50 eventos · Solo lectura</p>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { computed, ref } from 'vue';

const filters = ['Todos', 'Sesiones', 'Bovinos', 'Usuarios', 'Errores'];
const selectedFilter = ref('Todos');

const events = [
  { id: '1', category: 'Sesiones', message: 'MayoParra inicio sesion', date: '17/05 09:34' },
  { id: '2', category: 'Bovinos', message: 'IvanCh registro bovino El chirriche', date: '17/05 08:51' },
  { id: '3', category: 'Errores', message: 'Fallo estimacion · imagen invalida', date: '17/05 08:12' },
  { id: '4', category: 'Bovinos', message: 'IvanCh corrigio peso de Sombra a 530 Kg', date: '16/05 15:20' },
  { id: '5', category: 'Usuarios', message: 'Admin desactivo cuenta de AMora', date: '16/05 14:10' },
  { id: '6', category: 'Sesiones', message: 'DrSolano cerro sesion', date: '16/05 14:05' },
];

const visibleEvents = computed(() => {
  if (selectedFilter.value === 'Todos') {
    return events;
  }

  return events.filter((event) => event.category === selectedFilter.value);
});
</script>

<style scoped>
.page-surface {
  --background: #ffffff;
}

.content {
  padding: 22px 20px;
}

.subtitle {
  margin: 0 0 22px;
  color: #566071;
  text-align: center;
  font-size: 13px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.filter-row button {
  border: 0;
  border-radius: 999px;
  background: #a8acb8;
  color: #052b66;
  font-size: 12px;
  font-weight: 800;
  padding: 9px 16px;
}

.filter-row .active {
  background: #052b66;
  color: #ffffff;
}

.log-panel {
  display: grid;
  gap: 14px;
  min-height: 310px;
  margin-top: 30px;
  padding: 28px 12px;
  border-radius: 8px;
  background: #071832;
  color: #ffffff;
}

.log-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: start;
  font-size: 12px;
}

time {
  font-weight: 800;
}

.notice {
  margin-top: 12px;
  padding: 10px;
  background: #fff08a;
  color: #74601d;
  text-align: center;
  font-size: 12px;
}
</style>
