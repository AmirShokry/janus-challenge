<script setup lang="ts">
//@ts-expect-error
//For some reaason, the types are not working correctly without this error suppression
import { JanusJs, JanusVideoRoomPlugin } from "typed_janus_js";
import type {
  JanusJs as JanusType,
  JanusSession,
  JanusVideoRoomPlugin as JanusVideoRoomPluginType,
} from "@/types/janus";
import type { Mountpoint } from "@@/shared/types";

interface Participant {
  id: number;
  display: string;
  talking: boolean;
  publisher: true;
}

const remoteStream = ref<MediaStream | null>(null);
const janus = ref<JanusType | null>(null);
const session = ref<JanusSession | null>(null);
const subscriber = ref<JanusVideoRoomPluginType | null>(null);
const isConnecting = ref(false);
const isPlaying = ref(false);
const isRefreshing = ref(false);

const mountpoints = ref<Mountpoint[]>([]);
const selectedMountpoint = ref<number | null>(null);

onMounted(async () => {
  await fetchMountpoints();
  await initJanus();
});

async function fetchMountpoints() {
  try {
    isRefreshing.value = true;
    const data = await $fetch<Mountpoint[]>("/api/mountpoints");
    mountpoints.value = data;
  } catch (error) {
  } finally {
    isRefreshing.value = false;
  }
}
async function initJanus() {
  janus.value = new JanusJs({
    server: "wss://janus1.januscaler.com/janus/ws",
  });
  if (!janus?.value) return;
  await janus.value.init({ debug: false });
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
  if (isPlaying.value) return "Playing";
  if (isConnecting.value) return "Connecting";
  return "Stopped";
});

const statusColor = computed(() => {
  if (isPlaying.value) return "success";
  if (isConnecting.value) return "warning";
  return "error";
});

async function play() {
  if (!selectedMountpoint.value || !janus.value) return;

  try {
    isConnecting.value = true;

    const mountpoint = mountpoints.value.find(
      (mp) => mp.id === selectedMountpoint.value
    );
    if (!mountpoint || !mountpoint.roomId) {
      isConnecting.value = false;
      return;
    }

    session.value = await janus.value.createSession();
    subscriber.value = (await session.value.attach(
      JanusVideoRoomPlugin,
      {}
    )) as JanusVideoRoomPluginType;

    const { participants }: Record<string, Participant[]> =
      (await subscriber.value.listParticipants(mountpoint.roomId)) || {};
    const firstParticiapnt = participants?.at(0);

    await subscriber.value.joinRoomAsSubscriber(mountpoint.roomId, {
      streams: [
        {
          feed: firstParticiapnt?.id!,
          mid: "0" as any,
        },
        {
          feed: firstParticiapnt?.id!,
          mid: "1" as any,
        },
      ],
    });

    // Setup message handler for videoroom subscriber
    subscriber.value.onMessage.subscribe(async ({ jsep, message }) => {
      if (message?.videoroom === "joined")
        console.log("🚪 Joined room as subscriber");

      if (message?.videoroom === "event" && message?.error)
        return (isConnecting.value = false);

      if (!jsep) return;
      try {
        const answer = await subscriber.value?.createAnswer({
          jsep,
          tracks: [
            {
              type: "video",
              capture: false,
              recv: true,
            },
            {
              type: "audio",
              capture: false,
              recv: true,
            },
          ],
          media: {
            audioSend: false,
            videoSend: false,
          },
        });

        if (answer) {
          await subscriber.value?.send({
            message: { request: "start" },
            jsep: answer,
          });
          isPlaying.value = true;
          isConnecting.value = false;
        }
      } catch (error) {
        isConnecting.value = false;
      }
    });

    // Setup remote track handler
    subscriber.value.onRemoteTrack.subscribe(({ track, on, mid }) => {
      if (on) {
        if (!remoteStream.value) remoteStream.value = new MediaStream();
        remoteStream.value.addTrack(track);
      } else {
        if (remoteStream.value) remoteStream.value.removeTrack(track);
        isPlaying.value = false;
        remoteStream.value = null;
      }
    });
  } catch (error) {
    isConnecting.value = false;
  }
}
async function stop() {
  try {
    if (subscriber.value) await subscriber.value.detach();
    if (session.value) await session.value.destroy({ unload: true });
  } catch (error) {
    console.error("Error stopping stream:", error);
  }

  cleanup();
}

function cleanup() {
  remoteStream.value = null;
  isPlaying.value = false;
  isConnecting.value = false;
  subscriber.value = null;
  session.value = null;
  janus.value = null;
}

onUnmounted(() => {
  cleanup();
});
</script>

<template>
  <UCard class="max-w-2xl mx-auto glass-card">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-primary">Viewer - Streaming</h3>
        <UBadge :color="statusColor">
          {{ status }}
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
          :disabled="isPlaying || isConnecting || mountpoints.length <= 0"
        >
        </USelect>
      </section>

      <section
        aria-role="video-section"
        class="relative rounded-lg overflow-hidden"
        style="aspect-ratio: 16/9"
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
              ? "Click Play to start streaming"
              : "No stream selected"
          }}
        </div>
      </section>

      <footer aria-role="controls" class="flex gap-3 justify-center">
        <UButton
          @click="play"
          :disabled="!selectedMountpoint || isPlaying || isConnecting"
          :loading="isConnecting"
          color="success"
        >
          Play
        </UButton>

        <UButton
          @click="stop"
          :disabled="!isPlaying"
          color="error"
          variant="outline"
        >
          Stop
        </UButton>

        <UButton
          @click="refreshMountpoints"
          :loading="isRefreshing"
          color="secondary"
          variant="outline"
        >
          Refresh
        </UButton>
      </footer>
    </main>
  </UCard>
</template>
