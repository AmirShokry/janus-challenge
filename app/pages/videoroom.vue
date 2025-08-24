<script setup>
useHead({
  title: "WebRTC Publisher - Videoroom",
  meta: [
    {
      name: "description",
      content: "Join a Janus videoroom and publish your webcam stream",
    },
  ],
});
</script>

<template>
  <div class="min-h-screen relative z-10 py-8">
    <div class="container mx-auto px-4">
      <nav class="mb-8">
        <NuxtLink
          to="/"
          class="inline-flex items-center text-secondary hover:text-primary transition-colors"
        >
          <Icon name="heroicons:arrow-left" class="w-4 h-4 mr-2" />
          Back to Home
        </NuxtLink>
      </nav>
      <header class="text-center mb-8 fade-in-up">
        <div
          class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg"
        >
          <Icon name="heroicons:video-camera" class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-4xl font-bold text-primary mb-2">WebRTC Publisher</h1>
        <p class="text-lg text-secondary max-w-md mx-auto">
          Join a room and publish your webcam stream
        </p>
      </header>
      <main class="max-w-4xl mx-auto fade-in-up" style="animation-delay: 0.2s">
        <div class="rounded-2xl p-1">
          <PublisherCard />
        </div>
      </main>
    </div>
  </div>
</template>
