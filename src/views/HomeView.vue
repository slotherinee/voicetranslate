<script setup lang="ts">
import VoiceTranslate from '../components/VoiceTranslate.vue'
</script>

<template>
  <main class="home-main">
    <VoiceTranslate />
  </main>
</template>

<style scoped>
.home-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  padding: 2.5em 0.5em 1.5em 0.5em;
  background: none;
}
@media (max-width: 600px) {
  .home-main {
    padding: 1.2em 0.1em 1.2em 0.1em;
  }
}
</style>
