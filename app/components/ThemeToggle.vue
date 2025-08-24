<script setup lang="ts">
import { useColorMode } from "@vueuse/core";
const mode = useColorMode();
const theme = computed(() => mode.value);
function toggleTheme() {
  mode.value = mode.value === "dark" ? "light" : "dark";
}
</script>

<template>
  <button
    @click="toggleTheme"
    class="theme-toggle"
    :title="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <Icon
      :name="theme === 'dark' ? 'heroicons:sun' : 'heroicons:moon'"
      class="w-6 h-6"
    />
  </button>
</template>

<style scoped>
.theme-toggle {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 50;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-primary);
}

.theme-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}
</style>
