<script setup>
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
  <div class="min-h-screen flex items-center">
    <div class="container mx-auto px-4 py-16">
      <header class="text-center mb-12 fade-in-up">
        <h1 class="text-5xl font-bold text-primary mb-6 float-animation">
          Janus Challenge
        </h1>
        <p class="text-xl text-secondary max-w-2xl mx-auto leading-relaxed">
          A mini WebRTC demo app built with Nuxt4 and Janus. Publish your webcam
          stream or watch live streams from mountpoints.
        </p>
      </header>

      <main class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
        <section
          arial-role="publisher-section"
          class="glass-card rounded-2xl p-6 hover:transform hover:scale-105 transition-all duration-300 fade-in-up flex flex-col h-full"
        >
          <div class="flex items-center mb-6">
            <div
              class="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-lg"
            >
              <Icon name="heroicons:video-camera" class="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-primary">Publisher</h3>
              <p class="text-sm text-secondary">Broadcast your webcam</p>
            </div>
          </div>

          <div class="space-y-4 flex flex-col flex-1">
            <p class="text-secondary leading-relaxed">
              Join a Janus videoroom and publish your webcam stream. Your stream
              will be automatically registered as a mountpoint for viewers.
            </p>

            <ul class="text-sm text-secondary space-y-2">
              <li class="flex items-center">
                <Icon
                  name="heroicons:check-circle"
                  class="w-4 h-4 mr-2 text-blue-500"
                />
                Access your webcam and microphone
              </li>
              <li class="flex items-center">
                <Icon
                  name="heroicons:check-circle"
                  class="w-4 h-4 mr-2 text-blue-500"
                />
                Join a Janus videoroom
              </li>
              <li class="flex items-center">
                <Icon
                  name="heroicons:check-circle"
                  class="w-4 h-4 mr-2 text-blue-500"
                />
                Publish live stream
              </li>
              <li class="flex items-center">
                <Icon
                  name="heroicons:check-circle"
                  class="w-4 h-4 mr-2 text-blue-500"
                />
                Auto-register mountpoint
              </li>
            </ul>

            <NuxtLink to="/videoroom" class="block mt-auto">
              <UButton
                class="cursor-pointer w-full py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white text-shadow-2xs rounded-xl font-semibold text-lg justify-center"
              >
                Start Publishing
              </UButton>
            </NuxtLink>
          </div>
        </section>

        <section
          arial-role="viewer-section"
          class="glass-card rounded-2xl p-6 hover:transform hover:scale-105 transition-all duration-300 fade-in-up flex flex-col h-full delay-[0.2s]"
        >
          <div class="flex items-center mb-6">
            <div
              class="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4 shadow-lg"
            >
              <Icon name="heroicons:eye" class="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-primary">Viewer</h3>
              <p class="text-sm text-secondary">Watch live streams</p>
            </div>
          </div>

          <div class="space-y-4 flex flex-col flex-1">
            <p class="text-secondary leading-relaxed">
              Select from available mountpoints and watch live streams via the
              Janus streaming plugin.
            </p>

            <ul class="text-sm text-secondary space-y-2">
              <li class="flex items-center">
                <Icon
                  name="heroicons:check-circle"
                  class="w-4 h-4 mr-2 text-green-500"
                />
                Browse available mountpoints
              </li>
              <li class="flex items-center">
                <Icon
                  name="heroicons:check-circle"
                  class="w-4 h-4 mr-2 text-green-500"
                />
                Select streams to watch
              </li>
              <li class="flex items-center">
                <Icon
                  name="heroicons:check-circle"
                  class="w-4 h-4 mr-2 text-green-500"
                />
                Real-time video playback
              </li>
              <li class="flex items-center">
                <Icon
                  name="heroicons:check-circle"
                  class="w-4 h-4 mr-2 text-green-500"
                />
                Stream controls
              </li>
            </ul>

            <NuxtLink to="/streaming" class="block mt-auto">
              <UButton
                class="cursor-pointer bg-green-600 text-white text-shadow-2xs w-full py-3 px-6 custom-button rounded-xl font-semibold text-lg justify-center"
              >
                Start Watching
              </UButton>
            </NuxtLink>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>
