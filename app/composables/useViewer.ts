//@ts-expect-error
import { JanusJs, JanusVideoRoomPlugin } from "typed_janus_js";
import type {
  JanusJs as JanusType,
  JanusVideoRoomPlugin as JanusVideoRoomPluginType,
  JanusSession,
} from "@/types/janus";

interface Participant {
  id: number;
  display: string;
  talking: boolean;
  publisher: true;
}

interface InitOptions {
  server: string;
}

interface PlayOptions {
  mountpointId: number;
  roomId: number;
  onStop?: () => void;
}

export default function useViewer() {
  const instance = ref<JanusType | null>(null);
  const session = ref<JanusSession | null>(null);
  const subscriber = ref<JanusVideoRoomPluginType | null>(null);
  const remoteStream = ref<MediaStream | null>(null);
  const connecting = ref(false);
  const playing = ref(false);
  const error = ref<string | null>(null);

  async function init({ server }: InitOptions) {
    try {
      instance.value = new JanusJs({
        server: server || "wss://janus1.januscaler.com/janus/ws",
      });
      if (!instance.value) {
        throw new Error("Failed to create Janus instance");
      }
      await instance.value.init({ debug: false });
    } catch (err) {
      error.value = (err as any)?.message || String(err);
      throw err;
    }
  }

  async function play({ roomId, onStop }: PlayOptions) {
    try {
      if (!instance.value) {
        throw new Error("Janus instance not initialized");
      }

      connecting.value = true;
      error.value = null;

      if (!session.value) session.value = await instance.value.createSession();

      subscriber.value = (await session.value.attach(
        JanusVideoRoomPlugin,
        {}
      )) as JanusVideoRoomPluginType;

      const firstParticipant = await getFirstParaticipant({ roomId });

      if (!firstParticipant) {
        throw new Error("No participants found in the room");
      }

      await subscriber.value.joinRoomAsSubscriber(roomId, {
        streams: [
          {
            feed: firstParticipant.id,
            mid: "0" as any,
          },
          {
            feed: firstParticipant.id,
            mid: "1" as any,
          },
        ],
      });

      subscriber.value.onMessage.subscribe(async ({ jsep, message }) => {
        // if (message?.videoroom === "joined")
        //   console.log("🚪 Joined room as subscriber");

        if (message?.videoroom === "event" && message?.error) {
          connecting.value = false;
          return (error.value = message.error_code);
        }

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
            playing.value = true;
            connecting.value = false;
          }
        } catch (err) {
          error.value = (err as any)?.message || String(err);
          connecting.value = false;
        }
      });

      subscriber.value.onRemoteTrack.subscribe(({ track, on }) => {
        if (on) {
          if (!remoteStream.value) remoteStream.value = new MediaStream();

          remoteStream.value.addTrack(track);
        } else {
          if (remoteStream.value) remoteStream.value.removeTrack(track);

          if (remoteStream.value?.getTracks().length === 0) {
            remoteStream.value = null;
            playing.value = false;
            if (onStop) onStop();
          }
        }
      });

      return { success: true };
    } catch (err) {
      error.value = (err as any)?.message || String(err);
      connecting.value = false;
      return { success: false, error: error.value };
    }
  }

  async function getFirstParaticipant({ roomId }: { roomId: number }) {
    if (!subscriber.value) throw new Error("Subscriber not initialized");
    const { participants }: Record<string, Participant[]> =
      (await subscriber.value.listParticipants(roomId)) || {};

    return participants?.at(0);
  }

  async function stop(destroy = true) {
    subscriber.value?.hangup();
    cleanflags();
    // try {
    //   if (subscriber.value) await subscriber.value.detach();

    //   if (session.value && destroy)
    //     await session.value.destroy({ unload: true });

    //   cleanup(destroy);
    //   return { success: true };
    // } catch (err) {
    //   error.value = (err as any)?.message || String(err);
    //   cleanup(destroy);
    //   return { success: false, error: error.value };
    // }
  }
  function cleanflags() {
    connecting.value = false;
    playing.value = false;
  }

  function cleanup(destroy = true) {
    cleanflags();
    subscriber.value = null;
    remoteStream.value = null;
    error.value = null;

    if (!destroy) return;
    session.value = null;
    instance.value = null;
  }

  return {
    remoteStream: readonly(remoteStream),
    connecting: readonly(connecting),
    playing: readonly(playing),
    error: readonly(error),
    init,
    play,
    stop,
    cleanup,
  };
}
