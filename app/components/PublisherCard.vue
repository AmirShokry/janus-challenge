<script setup lang="ts">
//@ts-expect-error
import { JanusJs, JanusVideoRoomPlugin } from "typed_janus_js";
const localStream = ref<MediaStream | null>(null);
const janus = ref<JanusJs | null>(null);
const session = ref<any>(null);
const publisher = ref<JanusVideoRoomPlugin | null>(null);
const isConnecting = ref(false);
const isConnected = ref(false);
const isPublishing = ref(false);
const roomId = ref(1234); // Default room ID
const publisherId = ref<number | null>(null); // Store the publisher's ID
const mountpointId = ref(-1); // Default mountpoint ID

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

onMounted(async () => await getLocalStream());

onUnmounted(() => cleanup());

async function getLocalStream() {
  try {
    localStream.value = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720 },
      audio: true,
    });
  } catch (error) {
    // console.error("Error accessing media devices:", error);
    throw error;
  }
}

async function joinRoom() {
  try {
    if (!localStream.value) console.error("No local stream available");
    isConnecting.value = true;

    janus.value = new JanusJs({
      server: "wss://janus1.januscaler.com/janus/ws",
    });
    await janus.value.init({
      debug: false,
    });

    session.value = await janus.value.createSession();
    publisher.value = await session.value.attach(JanusVideoRoomPlugin);
    const username = `Publisher-${Date.now()}`;
    await publisher.value.joinRoomAsPublisher(roomId.value, {
      display: username,
    });
    // Setup message handler
    publisher.value.onMessage.subscribe(async ({ jsep, message }: any) => {
      // console.log("Publisher message:", message, jsep);

      if (message?.videoroom === "joined") {
        // console.log("Joined room successfully");
        isConnected.value = true;
        isConnecting.value = false;
        // Store the publisher's ID (this is the feed ID that subscribers need)
        publisherId.value = message.id;
        // console.log("Publisher ID (Feed ID):", publisherId.value);

        // Register mountpoint with publisher ID
        try {
          const response = (await $fetch("/api/mountpoints", {
            method: "POST",
            body: {
              description: `Live Stream from Room ${roomId.value}`,
              roomId: roomId.value,
              publisherId: publisherId.value, // Include the publisher ID
            },
          })) as any;
          mountpointId.value = response?.id;

          // console.log("Mountpoint registered:", response);
        } catch (error) {
          // console.error("Error registering mountpoint:", error);
        }
      }

      if (message?.videoroom === "event") {
        if (message?.configured === "ok") {
          // console.log("Publisher configured successfully");
          isPublishing.value = true;
        }
      }

      if (jsep) await publisher.value?.handleRemoteJsep({ jsep });
    });

    // // Setup remote track handler
    // publisher.value.onRemoteTrack.subscribe(({ track, on, mid }: any) => {
    //   // console.log("Remote track:", { track, on, mid });
    // });

    // Join room as publisher
  } catch (error) {
    // console.error("Error joining room:", error);
    isConnecting.value = false;
  }
}

async function publish() {
  if (!publisher.value || !localStream.value) return;

  try {
    // Create offer and publish
    const offer = await publisher.value.createOffer({
      media: { audio: true, video: true },
      stream: localStream.value,
    });

    await publisher.value.publishAsPublisher(offer, { bitrate: 2000000 });
  } catch (error) {
    console.error("Error publishing:", error);
    isPublishing.value = false;
  }
}

async function leaveRoom() {
  try {
    if (publisher.value) await publisher.value.detach();

    if (session.value) await session.value.destroy();

    await $fetch("/api/mountpoints", {
      method: "DELETE",
      body: { id: mountpointId.value },
    });
  } catch (error) {
    console.error("Error leaving room:", error);
  }

  cleanup();
}

function cleanup() {
  leaveRoom();
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
  mountpointId.value = -1;
}
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

    <div class="space-y-6">
      <div
        class="relative bg-gray-100 rounded-lg overflow-hidden"
        style="aspect-ratio: 16/9"
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
      </div>

      <div class="flex gap-3 justify-center">
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
      </div>

      <!-- Room Info -->
      <!-- <div v-if="isConnected" class="text-sm text-gray-600 text-center">
        Room ID: {{ roomId }}
        <div v-if="publisherId">Publisher ID (Feed): {{ publisherId }}</div>
      </div> -->
    </div>
  </UCard>
</template>
