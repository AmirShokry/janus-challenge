//@ts-expect-error
import { JanusJs, JanusVideoRoomPlugin } from "typed_janus_js";
import type {
  JanusJs as JanusType,
  JanusVideoRoomPlugin as JanusVideoRoomPluginType,
  JanusSession,
} from "@/types/janus";

interface InitOptions {
  server: string;
}
interface PublishOptions {
  stream: Ref<MediaStream | null>;
  roomId: number;
  description?: string;
}
interface createOfferOptions {
  stream: Ref<MediaStream | null>;
}
interface JoinRoomOptions {
  roomId: number;
  username?: string;
}
interface LeaveRoomOptions {
  roomId: number;
  destroy?: boolean;
}
export default function usePublisher() {
  const instance = ref<JanusType | null>(null);
  const session = ref<JanusSession | null>(null);
  const publisher = ref<JanusVideoRoomPluginType | null>(null);
  const connecting = ref(false);
  const connected = ref(false);
  const publishing = ref(false);
  const error = ref<string | null>(null);

  async function init({ server }: InitOptions) {
    instance.value = new JanusJs({
      server: server || `wss://janus1.januscaler.com/janus/ws`,
    });
    if (!instance.value)
      return (error.value = "Failed to create Janus instance");
    await instance.value.init({ debug: false });
  }

  async function joinRoom({ roomId, username }: JoinRoomOptions) {
    let success = false;
    try {
      if (!instance.value)
        throw (error.value = "Janus instance is not initialized"); // might need to re-initialize
      connecting.value = true;
      session.value = await instance.value.createSession();
      publisher.value = await session.value.attach<JanusVideoRoomPluginType>(
        JanusVideoRoomPlugin,
        {}
      );
      if (!publisher.value)
        throw (error.value = "Failed to attach to video room plugin");
      await publisher.value.joinRoomAsPublisher(roomId, {
        display: username || `Publisher- ${Date.now()}`,
      });

      publisher.value.onMessage.subscribe(async ({ message, jsep }) => {
        if (message?.videoroom === "joined") {
          connected.value = true;
          connecting.value = false;
        }
        if (message?.videoroom === "event" && message?.configured === "ok")
          publishing.value = true;

        if (jsep) await publisher.value?.handleRemoteJsep({ jsep });
      });
      success = true;
    } catch (err) {
      error.value = (err as any)?.message || String(err);
    } finally {
      return {
        success,
        error: error.value,
      };
    }
  }

  async function publishStream({
    stream,
    roomId,
    description,
  }: PublishOptions) {
    let success = false;
    try {
      if (!publisher.value || !stream || !stream.value)
        throw "Publisher or stream are not initialized #1";
      await $fetch("/api/mountpoints", {
        method: "POST",
        body: {
          description: description || "No description",
          roomId,
        },
      });
      success = true;
    } catch (err) {
      publishing.value = false;
      error.value = (err as any)?.message || err;
    }
    if (!success) return { success, error: error.value };
    return await createOffer({ stream });
  }

  async function createOffer({ stream }: createOfferOptions) {
    let success = false;
    try {
      if (!publisher.value || !stream.value)
        throw "Publisher or stream are not initialized #2";
      const offer = await publisher.value.createOffer({
        media: { audio: true, video: true },
        tracks: [
          { type: "video", capture: stream.value.getVideoTracks()[0]! },
          { type: "audio", capture: stream.value.getAudioTracks()[0]! },
        ],
      });

      await publisher.value.publishAsPublisher(offer, { bitrate: 2000000 });
      success = true;
    } catch (err) {
      publishing.value = false;
      error.value = (err as any)?.message || err;
    } finally {
      return {
        success,
        error: error.value,
      };
    }
  }

  async function leaveRoom({ roomId, destroy = true }: LeaveRoomOptions) {
    try {
      if (publisher.value && destroy) await publisher.value.detach();

      if (session.value)
        await session.value.destroy({ notifyDestroyed: true, unload: true });

      if (!roomId) throw Error("roomId is required to delete mountpoint");
      await $fetch("/api/mountpoints", {
        method: "DELETE",
        body: { roomId },
      });
    } catch (err) {
      error.value = (err as any)?.message || String(err);
    } finally {
      cleanup(destroy);
    }
  }
  function cleanflags() {
    connected.value = false;
    connecting.value = false;
    publishing.value = false;
  }

  function cleanup(destroy = true) {
    cleanflags();
    error.value = null;
    if (!destroy) return;
    publisher.value = null;
    session.value = null;
    instance.value = null;
  }

  return {
    connected: readonly(connected),
    connecting: readonly(connecting),
    error: readonly(error),
    publishing: readonly(publishing),
    init,
    joinRoom,
    publishStream,
    leaveRoom,
    cleanup,
  };
}
