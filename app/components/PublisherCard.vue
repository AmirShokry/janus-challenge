<script setup lang="ts">
const {
  publishing,
  error,
  connecting,
  connected,
  init,
  publishStream,
  joinRoom,
  leaveRoom,
} = usePublisher();
const localStream = ref<MediaStream | null>(null);
const roomId = ref(1234);

onMounted(async () => {
  await init({ server: "wss://janus1.januscaler.com/janus/ws" });
  await initLocalStream();
});

const status = computed(() => {
  if (publishing.value) return { text: "Publishing", color: "success" };
  if (connected.value) return { text: "Connected", color: "primary" };
  if (connecting.value) return { text: "Connecting", color: "warning" };
  return { text: "Disconnected", color: "error" };
});

async function initLocalStream() {
  try {
    localStream.value = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720 },
      audio: true,
    });
  } catch (error) {
    throw error;
  }
}

function handlePublishStream() {
  publishStream({
    roomId: roomId.value,
    stream: localStream,
    description: `Janus ${new Date().toLocaleTimeString()}`,
  });
}

function handleLeaveRoom() {
  leaveRoom({ roomId: roomId.value, destroy: false });
  refreshLocalStream();
}

function refreshLocalStream() {
  initLocalStream();
}
function clearLocalStream() {
  if (localStream.value) {
    localStream.value.getTracks().forEach((track) => track.stop());
    localStream.value = null;
  }
}

onUnmounted(() => {
  leaveRoom({ roomId: roomId.value });
  clearLocalStream();
});
</script>

<template>
  <UCard class="max-w-2xl mx-auto glass-card">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-primary">
          Publisher - Videoroom
        </h3>
        <UBadge :color="(status.color as any)" variant="soft">
          {{ status.text }}
        </UBadge>
      </div>
    </template>

    <main class="space-y-6">
      <section
        aria-role="video-section"
        class="relative bg-gray-100 rounded-lg overflow-hidden aspect-video"
      >
        <video
          :srcObject="localStream"
          autoplay
          muted
          playsinline
          class="w-full h-full object-cover"
        />
        <div
          v-if="!localStream"
          class="absolute inset-0 flex items-center justify-center text-secondary"
        >
          No camera stream
        </div>
      </section>

      <footer aria-role="controls" class="flex gap-3 justify-center">
        <UButton
          @click="joinRoom({ roomId })"
          :disabled="connected || connecting"
          :loading="connecting"
          color="primary"
        >
          Join Room
        </UButton>

        <UButton
          @click="handlePublishStream"
          :disabled="!connected || publishing"
          :loading="publishing"
          color="success"
        >
          Publish
        </UButton>

        <UButton
          @click="handleLeaveRoom"
          :disabled="!connected"
          color="error"
          variant="outline"
        >
          Leave Room
        </UButton>
      </footer>
    </main>
  </UCard>
</template>
