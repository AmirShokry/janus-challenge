import { BehaviorSubject, Subject } from "rxjs";

export declare class JanusPlugin implements PluginHandle {
  protected statsReportHookTimer: any;
  protected controllers: Controllers;
  protected instance: JanusJs;
  static identifier: string;
  protected handle: PluginHandle;
  protected session: JanusSession;
  protected mediaRecorder: MediaRecorder;
  plugin: string;
  id: string;
  token?: string;
  detached: boolean;
  webrtcStuff: WebRTCInfo;
  recording: boolean;
  statsQueryInterval: number;
  constructor(
    instance: JanusJs,
    session: JanusSession,
    handle: PluginHandle,
    controllers: Controllers
  );
  protected promisify<T>(functionCall: any, ...parameters: any[]): Promise<T>;
  replaceTracks(
    options: Pick<PluginReplaceTracksParam, "tracks">
  ): Promise<void>;
  getVolume(mid: string): Promise<number>;
  getRemoteVolume(mid: string): Promise<number>;
  getLocalVolume(mid: string): Promise<number>;
  isAudioMuted(): boolean;
  muteAudio(): void;
  unmuteAudio(): void;
  isVideoMuted(): boolean;
  muteVideo(): void;
  unmuteVideo(): void;
  getBitrate(): string;
  setMaxBitrate(bitrate: number): void;
  getLocalTracks(): TrackDesc[];
  getRemoteTracks(): TrackDesc[];
  recordingTimeSlice?: number;
  protected handleRecordingSetup(controllers: Controllers): void;
  sendTrickle(): Promise<void>;
  protected handleStatsHook(
    plugin: PluginHandle,
    controllers: Controllers,
    mediaStreamTrack?: MediaStreamTrack
  ): number;
  get recorder(): MediaRecorder;
  get onRecordingData(): import("rxjs").Observable<{
    blob: Blob;
    chunkNumber: number;
  }>;
  get onStatReports(): import("rxjs").Observable<any[]>;
  get onMessage(): import("rxjs").Observable<{
    message: MessageCallback | any;
    jsep: JSEP;
  }>;
  get onLocalTrack(): import("rxjs").Observable<{
    track: MediaStreamTrack;
    on: boolean;
  }>;
  get onData(): import("rxjs").Observable<any>;
  get onError(): import("rxjs").Observable<any>;
  get onRemoteTrack(): import("rxjs").Observable<{
    track: MediaStreamTrack;
    on: boolean;
    mid: string;
  }>;
  get onMediaState(): import("rxjs").Observable<{
    medium: "audio" | "video";
    recieving: boolean;
    mid: number;
  }>;
  get onSlowLink(): import("rxjs").Observable<{
    uplink: boolean;
    lost: number;
    mid: string;
  }>;
  get onWebRTCState(): import("rxjs").Observable<boolean>;
  get onIceState(): import("rxjs").Observable<
    "connected" | "failed" | "disconnected" | "closed"
  >;
  get onDataOpen(): import("rxjs").Observable<void>;
  get onDetached(): import("rxjs").Observable<void>;
  get onCleanup(): import("rxjs").Observable<void>;
  getId(): string;
  getPlugin(): string;
  send(message: Omit<PluginMessage, "success" | "error">): Promise<any>;
  createOffer(
    params: Omit<OfferParams, "success" | "error">
  ): Promise<RTCSessionDescription>;
  createAnswer(
    params: Omit<PluginCreateAnswerParam, "success" | "error">
  ): Promise<RTCSessionDescription>;
  data(params: DataParams): Promise<void>;
  handleRemoteJsep(params: { jsep: JSEP }): Promise<void>;
  dtmf(params: any): void;
  hangup(sendRequest?: boolean): Promise<void>;
  detach(params?: Omit<DetachOptions, "success" | "error">): Promise<void>;
  stopCollectingStats(): void;
}
export declare abstract class JanusPlugins {
  static VIDEO_ROOM: string;
  static VIDEO_CALL: string;
  static AUDIO_BRIDGE: string;
  static SIP: string;
  static STREAMING: string;
  static ECHO_TEST: string;
}

export declare class JanusSession {
  protected instance: JanusJs;
  constructor(instance: JanusJs);
  getServer(): string;
  isConnected(): boolean;
  getSessionId(): number;
  private getObservableControllers;
  cast<T>(t: T): T;
  attach<T extends JanusPlugin>(
    classToCreate: new (...args: any) => T,
    options: Pick<PluginOptions, "opaqueId">
  ): Promise<T>;
  reconnect(): Promise<boolean>;
  getInfo(): Promise<any>;
  destroy(callbacks: Omit<DestroyOptions, "success" | "error">): Promise<void>;
}
export interface Dependencies {
  adapter: any;
  WebSocket: (server: string, protocol: string) => WebSocket;
  isArray: (array: any) => array is Array<any>;
  extension: ChromeExtension;
  httpAPICall: (url: string, options: HttpApiCallOption) => void;
}
export interface DefaultDependencies extends Dependencies {
  fetch: typeof fetch;
  Promise: PromiseConstructorLike;
}
export interface OldDependencies extends Dependencies {
  jQuery: typeof jQuery;
}
export interface DependenciesResult {
  adapter: any;
  newWebSocket: (server: string, protocol: string) => WebSocket;
  isArray: (array: any) => array is Array<any>;
  extension: ChromeExtension;
  httpAPICall: (url: string, options: HttpApiCallOption) => void;
}
type ChromeExtension = {
  cache?: {
    [key in string]: GetScreenCallback;
  };
  extensionId: string;
  isInstalled: () => boolean;
  getScreen: (callback: GetScreenCallback) => void;
  init: () => void;
};
type GetScreenCallback = (error?: any, sourceId?: any) => void;
type HttpApiCallOption = {
  async: boolean;
  verb: string;
  body: JanusRequest;
  timeout: number;
  withCredentials: boolean;
  success: (result: unknown) => void;
  error: (error: string, reason?: unknown) => void;
};
type JanusRequest = {
  plugin?: string;
  token?: string;
  apisecret?: string;
  session_id?: number;
  handle_id?: number;
  opaque_id?: string;
  loop_index?: number;
  janus: string;
  transaction: string;
  body?: any;
  jsep?: JSEP;
};
declare enum DebugLevel {
  Trace = "trace",
  vDebug = "vdebug",
  Debug = "debug",
  Log = "log",
  Warning = "warn",
  Error = "error",
}
export interface JSEP {
  e2ee?: boolean;
  sdp?: string;
  type?: string;
  rid_order?: "hml" | "lmh";
  force_relay?: boolean;
}
export interface InitOptions {
  debug?: boolean | "all" | DebugLevel[];
  callback?: Function;
  dependencies?: DependenciesResult;
}
export interface ReconnectOptions {
  success?: Function;
  error?: (error: string) => void;
}
export interface DestroyOptions {
  cleanupHandles?: boolean;
  notifyDestroyed?: boolean;
  unload?: boolean;
  success?: () => void;
  error?: (error: string) => void;
}
export interface GetInfoOptions {
  success?: (info: any) => void;
  error?: (error: string) => void;
}
export interface PluginCallbacks {
  dataChannelOptions?: RTCDataChannelInit;
  success?: (handle: PluginHandle) => void;
  error?: (error: string) => void;
  consentDialog?: (on: boolean) => void;
  webrtcState?: (isConnected: boolean) => void;
  iceState?: (
    state: "connected" | "failed" | "disconnected" | "closed"
  ) => void;
  mediaState?: (
    medium: "audio" | "video",
    receiving: boolean,
    mid?: number
  ) => void;
  slowLink?: (uplink: boolean, lost: number, mid: string) => void;
  onmessage?: (message: Message, jsep?: JSEP) => void;
  onlocaltrack?: (track: MediaStreamTrack, on: boolean) => void;
  onremotetrack?: (track: MediaStreamTrack, mid: string, on: boolean) => void;
  ondataopen?: Function;
  ondata?: Function;
  oncleanup?: Function;
  ondetached?: Function;
}
export interface PluginOptions extends PluginCallbacks {
  plugin: string;
  opaqueId?: string;
  token?: string;
  loopIndex?: number;
}
export interface OfferParams {
  tracks?: TrackOption[];
  trickle?: boolean;
  iceRestart?: boolean;
  success?: (jsep: JSEP) => void;
  error?: (error: Error) => void;
  customizeSdp?: (jsep: JSEP) => void;
  /** @deprecated use tracks instead */
  media?: {
    audioSend?: boolean;
    audioRecv?: boolean;
    videoSend?: boolean;
    videoRecv?: boolean;
    audio?:
      | boolean
      | {
          deviceId: string;
        };
    video?:
      | boolean
      | {
          deviceId: string;
        }
      | "lowres"
      | "lowres-16:9"
      | "stdres"
      | "stdres-16:9"
      | "hires"
      | "hires-16:9";
    data?: boolean;
    failIfNoAudio?: boolean;
    failIfNoVideo?: boolean;
    screenshareFrameRate?: number;
  };
}
export interface PluginMessage {
  message: {
    request: string;
    [otherProps: string]: any;
  };
  jsep?: JSEP;
  success?: (data?: any) => void;
  error?: (error: string) => void;
}
export interface WebRTCInfo {
  bitrate: {
    bsbefore: string | null;
    bsnow: string | null;
    timer: string | null;
    tsbefore: string | null;
    tsnow: string | null;
    value: string | null;
  };
  dataChannel: {
    [key in string]: RTCDataChannel;
  };
  dataChannelOptions: RTCDataChannelInit;
  dtmfSender: RTCDTMFSender;
  iceDone: boolean;
  mediaConstraints: any;
  mySdp: {
    sdp: string;
    type: string;
  };
  myStream: MediaStream;
  pc: RTCPeerConnection;
  receiverTransforms: {
    audio: TransformStream;
    video: TransformStream;
  };
  remoteSdp: string;
  remoteStream: MediaStream;
  senderTransforms: {
    audio: TransformStream;
    video: TransformStream;
  };
  started: boolean;
  streamExternal: boolean;
  trickle: boolean;
  volume: {
    value: number;
    timer: number;
  };
  sdpSent: boolean;
  insertableStreams?: any;
  candidates: RTCIceCandidateInit[];
}
export type PluginCreateAnswerParam = {
  jsep: JSEP;
  tracks?: TrackOption[];
  /** @deprecated use tracks instead */
  media?: {
    audioSend: any;
    videoSend: any;
  };
  success?: (data: JSEP) => void;
  error?: (error: string) => void;
};
export type PluginHandleRemoteJsepParam = {
  jsep: JSEP;
  success?: (data: JSEP) => void;
  error?: (error: string) => void;
};
export type PluginReplaceTracksParam = {
  tracks: TrackOption[];
  success?: (data: unknown) => void;
  error?: (error: string) => void;
};
export type TrackOption = {
  add?: boolean;
  replace?: boolean;
  remove?: boolean;
  type: "video" | "screen" | "audio" | "data";
  mid?: string;
  capture: boolean | MediaStreamTrack;
  recv?: boolean;
  group?: "default" | string;
  gumGroup?: TrackOption["group"];
  simulcast?: boolean;
  svc?: string;
  simulcastMaxBitrates?: {
    low: number;
    medium: number;
    high: number;
  };
  sendEncodings?: RTCRtpEncodingParameters;
  framerate?: number;
  bitrate?: number;
  dontStop?: boolean;
  transforms?: {
    sender: ReadableWritablePair;
    receiver: ReadableWritablePair;
  };
};
export type PluginDtmfParam = {
  dtmf: Dtmf;
  success?: (data: unknown) => void;
  error?: (error: string) => void;
};
export type Dtmf = {
  tones: string;
  duration: number;
  gap: number;
};
export type PluginDataParam = {
  success?: (data: unknown) => void;
  error?: (error: string) => void;
  text: string;
};
export type TrackDesc = {
  mid?: string;
  type?: string;
  id?: string;
  label?: string;
};
export interface DetachOptions {
  success?: () => void;
  error?: (error: string) => void;
  noRequest?: boolean;
}
export interface PluginHandle {
  plugin: string;
  id: string;
  token?: string;
  detached: boolean;
  webrtcStuff: WebRTCInfo;
  getId(): string;
  getPlugin(): string;
  getVolume(mid: string, callback: (result: number) => void): void;
  getRemoteVolume(mid: string, callback: (result: number) => void): void;
  getLocalVolume(mid: string, callback: (result: number) => void): void;
  isAudioMuted(): boolean;
  muteAudio(): void;
  unmuteAudio(): void;
  isVideoMuted(): boolean;
  muteVideo(): void;
  unmuteVideo(): void;
  getBitrate(): string;
  setMaxBitrate(bitrate: number): void;
  send(message: PluginMessage): void;
  data(params: PluginDataParam): void;
  dtmf(params: PluginDtmfParam): void;
  createOffer(params: OfferParams): void;
  createAnswer(params: PluginCreateAnswerParam): void;
  handleRemoteJsep(params: PluginHandleRemoteJsepParam): void;
  replaceTracks(params: PluginReplaceTracksParam): Promise<void>;
  getLocalTracks(): TrackDesc[];
  getRemoteTracks(): TrackDesc[];
  hangup(sendRequest?: boolean): void;
  detach(params?: DetachOptions): void;
}
declare namespace JanusJS {
  class Janus {
    static webRTCAdapter: any;
    static safariVp8: boolean;
    static useDefaultDependencies(
      deps: Partial<Dependencies>
    ): DependenciesResult;
    static useOldDependencies(deps: Partial<Dependencies>): DependenciesResult;
    static init(options: InitOptions): void;
    static isWebrtcSupported(): boolean;
    static debug(...args: any[]): void;
    static log(...args: any[]): void;
    static warn(...args: any[]): void;
    static error(...args: any[]): void;
    static randomString(length: number): string;
    static attachMediaStream(
      element: HTMLMediaElement,
      stream: MediaStream
    ): void;
    static reattachMediaStream(
      to: HTMLMediaElement,
      from: HTMLMediaElement
    ): void;
    static stopAllTracks(stream: MediaStream): void;
    constructor(options: ConstructorOptions);
    attach(options: PluginOptions): void;
    getServer(): string;
    isConnected(): boolean;
    reconnect(callbacks: ReconnectOptions): void;
    getSessionId(): number;
    getInfo(callbacks: GetInfoOptions): void;
    destroy(callbacks: DestroyOptions): void;
  }
}
declare const _default: typeof JanusJS.Janus;
export default _default;
export { JanusJS };
export interface ConstructorOptions {
  server: string | string[];
  iceServers?: RTCIceServer[];
  ipv6?: boolean;
  withCredentials?: boolean;
  max_poll_events?: number;
  destroyOnUnload?: boolean;
  token?: string;
  apisecret?: string;
  success?: Function;
  error?: (error: any) => void;
  destroyed?: Function;
  iceTransportPolicy?: RTCIceTransportPolicy;
  bundlePolicy?: RTCBundlePolicy;
  keepAlivePeriod?: number;
  longPollTimeout?: number;
}
export declare enum MessageType {
  Recording = "recording",
  Starting = "starting",
  Started = "started",
  Stopped = "stopped",
  SlowLink = "slow_link",
  Preparing = "preparing",
  Refreshing = "refreshing",
}
export interface Message {
  result?: {
    status: MessageType;
    id?: string;
    uplink?: number;
  };
  error?: string;
  [key: string]: any;
}
export interface MessageCallback extends Object {
  result: Result;
}
export interface Result extends Object {
  event: string;
}
export interface Controllers {
  onMessageController: Subject<{
    message: MessageCallback | any;
    jsep: JSEP;
  }>;
  onLocalTrackController: BehaviorSubject<{
    track: MediaStreamTrack;
    on: boolean;
  }>;
  onRemoteTrackController: Subject<{
    track: MediaStreamTrack;
    on: boolean;
    mid: string;
  }>;
  onRecordingDataController: Subject<{
    blob: Blob;
    chunkNumber: number;
  }>;
  onStatReportsController: Subject<any[]>;
  onDataController: BehaviorSubject<any>;
  onErrorController: BehaviorSubject<any>;
  onMediaStateController: BehaviorSubject<{
    medium: "audio" | "video";
    recieving: boolean;
    mid: number;
  }>;
  onSlowLinkController: BehaviorSubject<{
    uplink: boolean;
    lost: number;
    mid: string;
  }>;
  onWebRTCStateController: BehaviorSubject<boolean>;
  onIceStateController: BehaviorSubject<
    "connected" | "failed" | "disconnected" | "closed"
  >;
  onDataOpenController: BehaviorSubject<void>;
  onDetachedController: BehaviorSubject<void>;
  onCleanupController: BehaviorSubject<void>;
}
export interface CreateRecordingController {
  blob: Blob;
  chunkNumber: number;
}
export interface CreateRecordingResult {
  mediaRecorder: MediaRecorder;
  controller: Subject<CreateRecordingController>;
}
export interface AnswerParams {
  tracks?: {
    type: "video" | "audio" | "data";
    capture: boolean;
    recv: boolean;
  }[];
  media?: {
    audioSend?: boolean;
    addAudio?: boolean;
    addVideo?: boolean;
    addData?: boolean;
    audioRecv?: boolean;
    videoSend?: boolean;
    removeAudio?: boolean;
    removeVideo?: boolean;
    replaceAudio?: boolean;
    replaceVideo?: boolean;
    videoRecv?: boolean;
    audio?:
      | boolean
      | {
          deviceId: string;
        };
    video?:
      | boolean
      | {
          deviceId: string;
        }
      | "lowres"
      | "lowres-16:9"
      | "stdres"
      | "stdres-16:9"
      | "hires"
      | "hires-16:9";
    data?: boolean;
    failIfNoAudio?: boolean;
    failIfNoVideo?: boolean;
    screenshareFrameRate?: number;
  };
  jsep: any;
}
export interface DataParams {
  text: any;
}
export declare class JanusJs {
  protected instance: JanusJs;
  protected options: ConstructorOptions;
  statsQueryInterval: number;
  static isWebrtcSupported(): boolean;
  static debug(...args: any[]): void;
  static log(...args: any[]): void;
  static warn(...args: any[]): void;
  static error(...args: any[]): void;
  static randomString(length: number): string;
  static attachMediaStream(
    element: HTMLMediaElement,
    stream: MediaStream
  ): void;
  static reattachMediaStream(
    to: HTMLMediaElement,
    from: HTMLMediaElement
  ): void;
  static stopAllTracks(stream: MediaStream): void;
  constructor(
    options: Omit<ConstructorOptions, "success" | "error" | "destroyed">
  );
  onDestroyed: () => void;
  onError: (err: any) => void;
  init(params?: InitOptions): Promise<void>;
  static mix(audioContext: AudioContext, streams: MediaStream[]): any;
  static playMediaStream(mediaStream: MediaStream): AudioContext;
  static createRecording(options: {
    mediaStreams: MediaStream[];
    timeSlice?: number;
  }): CreateRecordingResult;
  createSession(): Promise<JanusSession>;
}

//VideoRoom
export interface UpdateAsSubscriberStream {
  feed: any;
  mid?: any;
  crossrefid?: any;
}
export declare class JanusVideoRoomPlugin extends JanusPlugin {
  static identifier: string;
  constructor(
    instance: Janus,
    session: JanusSession,
    handle: PluginHandle,
    controllers: Controllers
  );
  createRoom(options?: {
    room?: number;
    permanent?: boolean;
    description?: string;
    secret?: string;
    pin?: string;
    is_private?: boolean;
    allowed?: string[];
  }): Promise<any>;
  joinRoomAsPublisher(
    roomId: string | number,
    options: {
      token?: string;
      display?: string;
      id?: string;
    }
  ): Promise<any>;
  listParticipants(room: string | number): Promise<any>;
  joinRoomAsSubscriber(
    room: string | number,
    options: {
      feed_id?: number;
      private_id?: number;
      streams?: {
        feed: number;
        mid: number;
      }[];
    }
  ): Promise<any>;
  startAsSubscriber(answer: RTCSessionDescription): Promise<any>;
  publishAsPublisher(
    offer: RTCSessionDescription,
    options: {
      audiocodec?: string;
      videocodec?: string;
      bitrate?: number;
      record?: boolean;
      filename?: string;
      display?: string;
      audio_level_average?: number;
      audio_active_packets?: number;
      descriptions?: {
        mid: number;
        description: string;
      }[];
    }
  ): Promise<any>;
  unpublishAsPublisher(): Promise<any>;
  updateAsSubscriber({
    subscribe,
    unsubscribe,
  }: {
    subscribe: UpdateAsSubscriberStream[] | undefined;
    unsubscribe: UpdateAsSubscriberStream[] | undefined;
  }): Promise<any>;
  leave(): Promise<any>;
}
