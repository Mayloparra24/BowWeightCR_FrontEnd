<template>
  <article class="animal-item">
    <img :src="bovinoPhoto(bovino.photoUrl)" :alt="`Foto de ${bovino.name}`" @error="onBovinoPhotoError" />

    <div class="animal-main">
      <div class="animal-title-row">
        <h2>{{ bovino.name }}</h2>
        <router-link :to="`/app/bovinos/${bovino.id}`">Ver mas</router-link>
      </div>
      <p>{{ bovino.breed }} - {{ bovino.sex }}</p>
      <p class="muted">Arete {{ bovino.earTag }}</p>
      <p class="muted">
        {{ bovino.lastWeightDate ? `Ultimo pesaje ${bovino.lastWeightDate}` : 'Sin pesaje registrado' }}
      </p>
      <span v-if="bovino.status !== 'Activo'" class="status-pill">
        {{ bovino.status }}{{ bovino.motivoInactividad ? ` - ${bovino.motivoInactividad}` : '' }}
      </span>
    </div>

    <strong v-if="bovino.lastWeightKg > 0" class="weight">{{ bovino.lastWeightKg }} Kg</strong>
    <span v-else class="weight-empty">Sin pesaje</span>
  </article>
</template>

<script setup lang="ts">
import type { Bovino } from '@/shared/types/domain';
import { bovinoPhoto, onBovinoPhotoError } from '@/shared/utils/bovinoPhoto';

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
  border: 1px solid rgba(8, 37, 74, 0.08);
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 12px 24px rgba(8, 37, 74, 0.06);
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

.status-pill {
  width: max-content;
  max-width: 100%;
  display: inline-block;
  margin-top: 6px;
  padding: 4px 8px;
  border-radius: 999px;
  background: #fff4d6;
  color: #7a4b00;
  font-size: 9px;
  font-weight: 900;
  line-height: 1.15;
}

.weight {
  align-self: end;
  color: #052b66;
  font-size: 22px;
  font-weight: 900;
  white-space: nowrap;
}

.weight-empty {
  align-self: end;
  max-width: 70px;
  color: #566071;
  font-size: 10px;
  font-weight: 900;
  line-height: 1.15;
  text-align: right;
  text-transform: uppercase;
}
</style>
