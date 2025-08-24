<script setup lang="ts">
//For some reaason, the types are not working correctly without this error suppression
// @ts-expect-error
import { JanusJs, JanusVideoRoomPlugin } from "typed_janus_js";
import type {
  JanusJs as JanusType,
  JanusVideoRoomPlugin as JanusVideoRoomPluginType,
  JanusSession,
} from "@/types/janus";

const localStream = ref<MediaStream | null>(null);
const janus = ref<JanusType | null>(null);
const session = ref<JanusSession | null>(null);
const publisher = ref<JanusVideoRoomPluginType | null>(null);
const isConnecting = ref(false);
const isConnected = ref(false);
const isPublishing = ref(false);
const roomId = ref(1234);
const publisherId = ref<number | null>(null);

const status = computed(() => {
  if (isPublishing.value) return "Publishing";
  if (isConnected.value) return "Connected";
  if (isConnecting.value) return "Connecting";
  return "Disconnected";
});

const statusColor = computed(() => {
  if (isPublishing.value) return "success";
  if (isConnected.value) return "primary";
  if (isConnecting.value) return "warning";
  return "error";
});

onMounted(async () => {
  await init();
});

async function init() {
  async function initJanus() {
    janus.value = new JanusJs({
      server: "wss://janus1.januscaler.com/janus/ws",
    });
    if (!janus?.value) return;
    await janus.value.init({ debug: false });
  }

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
  await initJanus();
  await initLocalStream();
}

async function joinRoom() {
  try {
    if (!janus?.value || !localStream?.value) await init();
    if (!janus?.value) return console.error("Janus not initialized");
    if (!localStream.value) return console.error("No local stream available");

    isConnecting.value = true;

    session.value = await janus.value.createSession();
    publisher.value = (await session.value.attach(
      JanusVideoRoomPlugin,
      {}
    )) as JanusVideoRoomPluginType;
    if (!publisher?.value) return;
    const username = `Publisher-${Date.now()}`;
    await publisher.value.joinRoomAsPublisher(roomId.value, {
      display: username,
    });

    // Setup message handler
    publisher.value.onMessage.subscribe(async ({ jsep, message }) => {
      if (message?.videoroom === "joined") {
        isConnected.value = true;
        isConnecting.value = false;
        publisherId.value = message.id;
      }

      if (message?.videoroom === "event" && message?.configured === "ok")
        isPublishing.value = true;

      if (jsep) await publisher.value?.handleRemoteJsep({ jsep });
    });
    // Join room as publisher
  } catch (error) {
    isConnecting.value = false;
  }
}

async function publish() {
  if (!publisher.value || !localStream.value) return;

  try {
    await $fetch("/api/mountpoints", {
      method: "POST",
      body: {
        description: `Live Stream from Room ${roomId.value}`,
        roomId: roomId.value,
      },
    });
  } catch (error) {
    isPublishing.value = false;
    return console.error("Error creating mountpoint:", error);
  }

  try {
    // Create offer and publish
    const offer = await publisher.value.createOffer({
      media: { audio: true, video: true },
      tracks: [
        { type: "video", capture: localStream.value.getVideoTracks()[0]! },
        { type: "audio", capture: localStream.value.getAudioTracks()[0]! },
      ],
    });

    await publisher.value.publishAsPublisher(offer, { bitrate: 2000000 });
  } catch (error) {
    isPublishing.value = false;
  }
}

async function leaveRoom() {
  try {
    if (publisher.value) await publisher.value.detach();

    if (session.value)
      await session.value.destroy({ notifyDestroyed: true, unload: true });

    await $fetch("/api/mountpoints", {
      method: "DELETE",
      body: { roomId: roomId.value },
    });
  } catch (error) {
    console.error("Error leaving room:", error);
  }

  cleanup();
}

function cleanup() {
  if (localStream.value) {
    localStream.value.getTracks().forEach((track) => track.stop());
    localStream.value = null;
  }

  isConnected.value = false;
  isConnecting.value = false;
  isPublishing.value = false;
  publisherId.value = null;
  publisher.value = null;
  session.value = null;
  janus.value = null;
}

onUnmounted(() => {
  leaveRoom();
});
</script>

<template>
  <UCard class="max-w-2xl mx-auto glass-card">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-primary">
          Publisher - Videoroom
        </h3>
        <UBadge :color="statusColor" variant="soft">
          {{ status }}
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
          @click="joinRoom"
          :disabled="isConnected || isConnecting"
          :loading="isConnecting"
          color="primary"
        >
          Join Room
        </UButton>

        <UButton
          @click="publish"
          :disabled="!isConnected || isPublishing"
          :loading="isPublishing"
          color="success"
        >
          Publish
        </UButton>

        <UButton
          @click="leaveRoom"
          :disabled="!isConnected"
          color="error"
          variant="outline"
        >
          Leave Room
        </UButton>
      </footer>
    </main>
  </UCard>
</template>
