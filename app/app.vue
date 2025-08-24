<script setup>
import { useColorMode } from "@vueuse/core";
const mode = useColorMode();
const theme = computed(() => mode.value);
function toggleTheme() {
  mode.value = mode.value === "dark" ? "light" : "dark";
}
</script>

<template>
  <UApp>
    <button
      @click="toggleTheme"
      class="fixed top-8 right-8 z-50 cursor-pointer hover:scale-105 rounded-full bg-(--card-bg) size-10 flex items-center justify-center"
      :title="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
    >
      <Icon
        :name="theme === 'dark' ? 'heroicons:sun' : 'heroicons:moon'"
        class="size-6"
      />
    </button>
    <NuxtPage />
  </UApp>
</template>
