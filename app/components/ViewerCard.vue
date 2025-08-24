<script setup lang="ts">
import type { Mountpoint } from "@@/shared/types";

const { remoteStream, connecting, playing, error, init, play, stop, cleanup } =
  useViewer();

const mountpoints = ref<Mountpoint[]>([]);
const selectedMountpoint = ref<number | null>(null);
const refreshing = ref(false);
const refreshError = ref<string | null>(null);

onMounted(async () => {
  await init({ server: "wss://janus1.januscaler.com/janus/ws" });
  await fetchMountpoints();
});

async function fetchMountpoints() {
  try {
    refreshing.value = true;
    refreshError.value = null;
    const data = await $fetch<Mountpoint[]>("/api/mountpoints");
    mountpoints.value = data;
    return { success: true, data };
  } catch (err) {
    refreshError.value = (err as any)?.message || String(err);
    return { success: false, error: error.value };
  } finally {
    refreshing.value = false;
  }
}

function refreshMountpoints() {
  fetchMountpoints();
}

const mountpointOptions = computed(() => {
  return mountpoints.value.map((mp) => ({
    label: `${mp.description} (ID: ${mp.id})`,
    value: mp.id,
  }));
});

const status = computed(() => {
  if (playing.value) return { text: "Playing", color: "success" } as const;
  if (connecting.value)
    return { text: "Connecting", color: "warning" } as const;
  return { text: "Stopped", color: "error" } as const;
});

function onStop() {
  refreshMountpoints();
  selectedMountpoint.value = null;
}
async function handlePlay() {
  if (!selectedMountpoint.value) return;

  const mountpoint = mountpoints.value.find(
    (mp) => mp.id === selectedMountpoint.value
  );

  if (!mountpoint || !mountpoint.roomId) return;

  await play({
    mountpointId: selectedMountpoint.value,
    roomId: mountpoint.roomId,
    onStop: onStop,
  });
}

async function handleStop() {
  await stop(false); // Don't destroy the underlying connection, just stop the stream
}

onUnmounted(() => cleanup()); // Destroy everything on unmount);
</script>

<template>
  <UCard class="max-w-2xl mx-auto glass-card">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-primary">Viewer - Streaming</h3>
        <UBadge :color="status.color">
          {{ status.text }}
        </UBadge>
      </div>
    </template>

    <main class="space-y-6">
      <section aria-role="selection">
        <label class="block text-sm font-medium text-primary mb-2">
          Select Mountpoint ({{ mountpoints.length }} available)
        </label>
        <USelect
          v-model="selectedMountpoint!"
          :items="mountpointOptions"
          class="w-full p-2 border border-gray-300 glass-card rounded-md mb-2"
          :disabled="playing || connecting || mountpoints.length <= 0"
        >
        </USelect>
      </section>

      <section
        aria-role="video-section"
        class="relative rounded-lg overflow-hidden aspect-video"
      >
        <video
          :srcObject="remoteStream"
          autoplay
          playsinline
          controls
          class="w-full h-full object-cover"
        />
        <div
          v-if="!remoteStream"
          class="absolute inset-0 flex items-center justify-center text-gray-500"
        >
          {{
            selectedMountpoint
              ? "Click Play to start playing the stream"
              : "No stream selected"
          }}
        </div>
      </section>

      <footer aria-role="controls" class="flex gap-3 justify-center">
        <UButton
          @click="handlePlay"
          :disabled="!selectedMountpoint || playing || connecting"
          :loading="connecting"
          color="success"
        >
          Play
        </UButton>

        <UButton
          @click="handleStop"
          :disabled="!playing"
          color="error"
          variant="outline"
        >
          Stop
        </UButton>

        <UButton
          @click="refreshMountpoints"
          :loading="refreshing"
          color="secondary"
          variant="outline"
        >
          Refresh
        </UButton>
      </footer>
    </main>
  </UCard>
</template>
