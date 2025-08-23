<script setup>
// Set page metadata
useHead({
  title: "Janus WebRTC Demo - Home",
  meta: [
    {
      name: "description",
      content:
        "A mini WebRTC demo app built with Nuxt4 and Janus WebRTC Gateway",
    },
  ],
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-16">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Janus WebRTC Demo</h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          A mini WebRTC demo app built with Nuxt4 and Janus. Publish your webcam
          stream or watch live streams from mountpoints.
        </p>
      </div>

      <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <!-- Publisher Card -->
        <UCard class="hover:shadow-lg transition-shadow">
          <template #header>
            <div class="flex items-center">
              <div
                class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4"
              >
                <svg
                  class="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  ></path>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold">Publisher</h3>
                <p class="text-sm text-gray-600">Broadcast your webcam</p>
              </div>
            </div>
          </template>

          <div class="space-y-4">
            <p class="text-gray-700">
              Join a Janus videoroom and publish your webcam stream. Your stream
              will be automatically registered as a mountpoint for viewers.
            </p>

            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Access your webcam and microphone</li>
              <li>• Join a Janus videoroom</li>
              <li>• Publish live stream</li>
              <li>• Auto-register mountpoint</li>
            </ul>

            <NuxtLink to="/videoroom">
              <UButton color="blue" size="lg" block> Start Publishing </UButton>
            </NuxtLink>
          </div>
        </UCard>

        <!-- Viewer Card -->
        <UCard class="hover:shadow-lg transition-shadow">
          <template #header>
            <div class="flex items-center">
              <div
                class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4"
              >
                <svg
                  class="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4V8a3 3 0 016 0v2M5 18h14a2 2 0 002-2v-8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  ></path>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold">Viewer</h3>
                <p class="text-sm text-gray-600">Watch live streams</p>
              </div>
            </div>
          </template>

          <div class="space-y-4">
            <p class="text-gray-700">
              Select from available mountpoints and watch live streams via the
              Janus streaming plugin.
            </p>

            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Browse available mountpoints</li>
              <li>• Select streams to watch</li>
              <li>• Real-time video playback</li>
              <li>• Stream controls</li>
            </ul>

            <NuxtLink to="/streaming">
              <UButton color="green" size="lg" block> Start Watching </UButton>
            </NuxtLink>
          </div>
        </UCard>
      </div>

      <!-- Technical Info -->
      <div class="mt-16 text-center">
        <UCard class="max-w-2xl mx-auto">
          <template #header>
            <h3 class="text-lg font-semibold text-center">Technical Details</h3>
          </template>

          <div class="space-y-3 text-sm text-gray-600">
            <p>
              <strong>Janus Server:</strong>
              wss://janus1.januscaler.com/janus/ws
            </p>
            <p>
              <strong>Plugins Used:</strong> janus.plugin.videoroom,
              janus.plugin.streaming
            </p>
            <p><strong>Framework:</strong> Nuxt 4 with Nuxt UI Pro</p>
            <p><strong>WebRTC Library:</strong> typed_janus_js</p>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
