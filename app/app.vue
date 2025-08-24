<script setup>
import { useColorMode } from "@vueuse/core";
useColorMode();
</script>

<template>
  <UApp>
    <div class="main">
      <ThemeToggle />
      <NuxtPage />
    </div>
  </UApp>
</template>

<style scoped>
.main {
  position: relative;
  min-height: 100vh;
  background: light-dark(white, black);
}

.dark .main::before {
  opacity: 0.19;
}

.main::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 0;
  opacity: 0.8;

  background: url("@/assets/grain.svg");
}
</style>
