<script setup>
// useHead({
//   title: "WebRTC Publisher - Videoroom",
//   meta: [
//     {
//       name: "description",
//       content: "Join a Janus videoroom and publish your webcam stream",
//     },
//   ],
// });
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">WebRTC Publisher</h1>
        <p class="text-gray-600">
          Join a Janus videoroom and publish your webcam stream
        </p>
      </div>

      <PublisherCard />
    </div>
  </div>
</template>
