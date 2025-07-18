<script setup lang="ts">

</script>

<template>
  <div class="app-bg">
    <router-view />
  </div>
</template>

<style scoped>
.app-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  padding: 0;
}
</style>
