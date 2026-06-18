<template>
  <ion-page>
    <ion-content class="page-surface">
      <section class="content">
        <header class="page-header">
          <router-link class="back-button" to="/app/inicio" aria-label="Volver al inicio">
            <ion-icon :icon="chevronBackOutline" />
          </router-link>

          <div>
            <h1>Bitácora de actividad</h1>
            <p>Registro completo del sistema</p>
          </div>
        </header>

        <div class="filter-row">
          <button
            v-for="option in filtros"
            :key="option"
            :class="{ active: selectedFilter === option }"
            type="button"
            @click="selectedFilter = option"
          >
            {{ option }}
          </button>
        </div>

        <section class="log-panel" :class="{ empty: !visibleEvents.length }" aria-label="Eventos del sistema">
          <article v-for="event in visibleEvents" :key="event.id" class="log-row">
            <span>
              <strong>{{ event.descripcion }}</strong>
              <em v-if="event.usuarioNombre">{{ event.usuarioNombre }} · {{ event.accion }}</em>
            </span>
            <time>{{ event.creadaEl }}</time>
          </article>

          <p v-if="!visibleEvents.length" class="empty-state">No hay eventos registrados.</p>
        </section>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonPage, onIonViewWillEnter } from '@ionic/vue';
import { chevronBackOutline } from 'ionicons/icons';
import { computed, ref } from 'vue';
import { bitacoraRepo } from '@/shared/services/bitacoraRepo';
import type { BitacoraEvento } from '@/shared/types/domain';

const events = ref<BitacoraEvento[]>([]);
const selectedFilter = ref('Todos');

onIonViewWillEnter(async () => {
  try {
    const { items } = await bitacoraRepo.list({ perPage: 100 });
    events.value = items;
  } catch {
    events.value = [];
  }
});

const filtros = computed(() => {
  const tipos = Array.from(new Set(events.value.map((event) => event.entidadTipo))).filter(Boolean);
  return ['Todos', ...tipos];
});

const visibleEvents = computed(() => {
  if (selectedFilter.value === 'Todos') return events.value;
  return events.value.filter((event) => event.entidadTipo === selectedFilter.value);
});
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

.page-header p {
  margin: 4px 0 0;
  color: #566071;
  font-size: 11px;
  font-weight: 800;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin: 20px auto 0;
  max-width: 260px;
}

.filter-row button {
  border: 0;
  border-radius: 999px;
  background: #a8acb8;
  color: #052b66;
  font-size: 11px;
  font-weight: 900;
  padding: 8px 14px;
}

.filter-row .active {
  background: #052b66;
  color: #ffffff;
}

.log-panel {
  min-height: 284px;
  display: grid;
  gap: 14px;
  align-content: start;
  margin-top: 28px;
  padding: 22px 14px;
  border-radius: 8px;
  background: #071832;
  color: #ffffff;
}

.log-panel.empty {
  min-height: 284px;
  place-items: center;
}

.log-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: start;
  color: #dbe8f7;
  font-size: 11px;
  line-height: 1.35;
}

.log-row span {
  display: grid;
  gap: 3px;
}

.log-row strong {
  color: #ffffff;
  font-weight: 900;
}

.log-row em {
  color: #8bb7e5;
  font-style: normal;
  font-size: 10px;
  font-weight: 700;
}

time {
  color: #ffffff;
  font-weight: 900;
  white-space: nowrap;
}

.empty-state {
  margin: 0;
  color: #cfe0f5;
  font-size: 13px;
  font-weight: 900;
  text-align: center;
}
</style>
