<script setup>
// Set page metadata
useHead({
  title: "WebRTC Viewer - Streaming",
  meta: [
    {
      name: "description",
      content: "Watch live streams from Janus mountpoints",
    },
  ],
});
</script>
<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">WebRTC Viewer</h1>
        <p class="text-gray-600">Watch live streams from Janus mountpoints</p>
      </div>

      <ViewerCard />
    </div>
  </div>
</template>
