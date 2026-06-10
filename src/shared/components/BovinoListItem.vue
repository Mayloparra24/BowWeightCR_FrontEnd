<template>
  <article class="animal-item">
    <img :src="bovino.photoUrl" :alt="`Foto de ${bovino.name}`" />

    <div class="animal-main">
      <div class="animal-title-row">
        <h2>{{ bovino.name }}</h2>
        <router-link :to="`/app/bovinos/${bovino.id}`">Ver más</router-link>
      </div>
      <p>{{ bovino.breed }} - {{ bovino.sex }}</p>
      <p class="muted">Arete {{ bovino.earTag }}</p>
      <p class="muted">Último pesaje {{ bovino.lastWeightDate }}</p>
    </div>

    <strong class="weight">{{ bovino.lastWeightKg }} Kg</strong>
  </article>
</template>

<script setup lang="ts">
import type { Bovino } from '@/shared/types/domain';

defineProps<{
  bovino: Bovino;
}>();
</script>

<style scoped>
.animal-item {
  min-height: 96px;
  display: grid;
  grid-template-columns: 58px 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 10px;
  background: #d9d9d9;
}

img {
  width: 58px;
  height: 58px;
  border-radius: 8px;
  object-fit: cover;
}

.animal-main {
  min-width: 0;
}

.animal-title-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

h2 {
  margin: 0;
  color: #071832;
  font-size: 15px;
  font-weight: 800;
}

a {
  color: #2f75b5;
  font-size: 11px;
  font-weight: 800;
  text-decoration: none;
  white-space: nowrap;
}

p {
  margin: 3px 0 0;
  color: #2f75b5;
  font-size: 11px;
  font-weight: 700;
}

.muted {
  color: #4f79a8;
}

.weight {
  align-self: end;
  color: #052b66;
  font-size: 22px;
  font-weight: 900;
  white-space: nowrap;
}
</style>
