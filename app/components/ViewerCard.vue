<script setup lang="ts">
//@ts-expect-error
import { JanusJs, JanusVideoRoomPlugin } from "typed_janus_js";

interface Mountpoint {
  id: number;
  description: string;
  roomId: number | null;
  publisherId: number | null;
  createdAt: string;
}

const remoteVideo = ref<HTMLVideoElement>();
const remoteStream = ref<MediaStream | null>(null);
const janus = ref<JanusJs | null>(null);
const session = ref<any>(null);
const subscriber = ref<any>(null);
const isConnecting = ref(false);
const isPlaying = ref(false);
const isRefreshing = ref(false);

const mountpoints = ref<Mountpoint[]>([]);
const selectedMountpoint = ref<number | null>(null);

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

async function fetchMountpoints() {
  try {
    isRefreshing.value = true;
    // console.log("Fetching mountpoints...");
    const data = await $fetch<Mountpoint[]>("/api/mountpoints");
    mountpoints.value = data;
    // console.log("Fetched mountpoints:", data);
    // console.log("Mountpoints count:", data.length);
  } catch (error) {
    // console.error("Error fetching mountpoints:", error);
  } finally {
    isRefreshing.value = false;
  }
}

function refreshMountpoints() {
  fetchMountpoints();
}

async function play() {
  if (!selectedMountpoint.value) return;

  try {
    isConnecting.value = true;
    // console.log("Starting playback for mountpoint (room):",selectedMountpoint.value);

    // Get the mountpoint details
    const mountpoint = mountpoints.value.find(
      (mp) => mp.id === selectedMountpoint.value
    );
    if (!mountpoint || !mountpoint.roomId) {
      // console.error("Invalid mountpoint or no room ID");
      isConnecting.value = false;
      return;
    }

    janus.value = new JanusJs({
      server: "wss://janus1.januscaler.com/janus/ws",
    });
    await janus.value.init({ debug: false });

    session.value = await janus.value.createSession();
    subscriber.value = await session.value.attach(JanusVideoRoomPlugin);

    // Setup message handler for videoroom subscriber
    subscriber.value.onMessage.subscribe(async ({ jsep, message }: any) => {
      console.log("=== Subscriber message received ===");
      console.log(message);
      // console.log("📩 Subscriber message received");
      // console.log("=== Subscriber message received ===");
      // console.log("Message:", JSON.stringify(message, null, 2));
      // console.log("JSEP:", jsep);

      if (message?.videoroom === "joined")
        console.log("🚪 Joined room as subscriber");
      // console.log("✅ Joined room successfully as subscriber");

      if (message?.videoroom === "event") {
        // console.log("📢 VideoRoom event received");

        if (message?.error) {
          // console.error("❌ VideoRoom error:",message.error,"Code:",message.error_code);
          isConnecting.value = false;
          return;
        }

        // Handle new publishers joining
        if (message?.publishers && message.publishers.length > 0)
          console.log("👥 New publishers detected:", message.publishers);
      }

      if (jsep) {
        // console.log("🔄 Handling JSEP offer from publisher:", jsep);
        try {
          const answer = await subscriber.value?.createAnswer({
            jsep: jsep,
            media: {
              audioSend: false,
              videoSend: false,
              audio: true,
              video: true,
            },
          });

          if (answer) {
            // console.log("📤 Sending answer:", answer);
            await subscriber.value?.send({
              message: { request: "start" },
              jsep: answer,
            });
            // console.log("✅ Started subscriber session");
            isPlaying.value = true;
            isConnecting.value = false;
          }
        } catch (error) {
          // console.error("❌ Error handling JSEP:", error);
          isConnecting.value = false;
        }
      }
    });

    // Setup remote track handler
    subscriber.value.onRemoteTrack.subscribe(({ track, on, mid }: any) => {
      // console.log("🎥 Remote track event:", {track: track.kind,on,mid,id: track.id,});

      if (on) {
        if (!remoteStream.value) remoteStream.value = new MediaStream();
        remoteStream.value.addTrack(track);
        // console.log("✅ Added",track.kind,"track. Total tracks:",remoteStream.value.getTracks().length);
      } else {
        if (remoteStream.value) {
          remoteStream.value.removeTrack(track);
          // console.log("❌ Removed", track.kind, "track");
        }
      }
    });

    // Join as subscriber with the specific feed ID from the mountpoint
    // console.log("🚪 Joining room as subscriber with feed ID...");
    try {
      // console.log(`Trying to connect`);
      await subscriber.value?.send({
        message: {
          request: "join",
          room: mountpoint.roomId,
          ptype: "subscriber",
          feed: mountpoint.publisherId,
          display: `Viewer-${Date.now()}`,
        },
      });
      // console.log("✅ Join request sent successfully");
    } catch (error) {
      // console.error("❌ Error joining room:", error);
      isConnecting.value = false;
      return;
    }
  } catch (error) {
    // console.error("Error starting playback:", error);
    isConnecting.value = false;
  }
}
async function stop() {
  try {
    if (subscriber.value) await subscriber.value.detach();

    if (session.value) await session.value.destroy();
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

onMounted(() => {
  fetchMountpoints();
});

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

    <div class="space-y-6">
      <!-- Mountpoint Selection -->
      <div>
        <label class="block text-sm font-medium text-primary mb-2">
          Select Mountpoint ({{ mountpoints.length }} available)
        </label>

        <!-- Test with native select first -->
        <USelect
          v-model="selectedMountpoint!"
          :items="mountpointOptions"
          class="w-full p-2 border border-gray-300 glass-card rounded-md mb-2"
          :disabled="isPlaying"
        >
        </USelect>

        <!-- Debug info -->
        <!-- <div v-if="mountpoints.length > 0" class="mt-2 text-xs text-gray-500">
          Debug: Found {{ mountpoints.length }} mountpoints<br />
          Selected: {{ selectedMountpoint }}<br />
          <details>
            <summary>Raw data</summary>
            <pre class="text-xs">{{
              JSON.stringify(mountpoints, null, 2)
            }}</pre>
          </details>
          <details>
            <summary>Options data</summary>
            <pre class="text-xs">{{
              JSON.stringify(mountpointOptions, null, 2)
            }}</pre>
          </details>
        </div>
        <div v-else class="mt-2 text-xs text-red-500">
          No mountpoints available. Make sure a publisher is active.
        </div> -->
      </div>

      <!-- Remote Video -->
      <div
        class="relative rounded-lg overflow-hidden"
        style="aspect-ratio: 16/9"
      >
        <video
          ref="remoteVideo"
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
      </div>

      <!-- Controls -->
      <div class="flex gap-3 justify-center">
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
      </div>

      <!-- Stream Info -->
      <div
        v-if="selectedMountpoint && mountpoints.length > 0"
        class="text-sm text-gray-600 text-center"
      >
        Mountpoint ID: {{ selectedMountpoint }}
        <br />
        {{
          mountpoints.find((mp) => mp.id === selectedMountpoint)?.description
        }}
      </div>
    </div>
  </UCard>
</template>
