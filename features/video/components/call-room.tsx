"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Maximize,
  Minimize,
} from "lucide-react";
import { Preflight, type DeviceSelection } from "./preflight";

/**
 * P5-02/03 — the call room.
 * Layout: full-bleed remote video with name overlay, PiP self-view,
 * floating icon controls, live duration in the header (rendered by the
 * page). Token pre-fetched on mount, renewed via privilege-will-expire.
 * Completion is cron-driven (P5-04) — leaving is never the signal.
 */

interface TokenResponse {
  token: string;
  uid: number;
  channel: string;
  appId: string;
}

type CallState = "preflight" | "connecting" | "in-call" | "error" | "left";

export function CallRoom({
  sessionId,
  counterpartName,
}: {
  sessionId: string;
  counterpartName: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<CallState>("preflight");
  const [error, setError] = useState<string | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const micTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const camTrackRef = useRef<ICameraVideoTrack | null>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const joinedAtRef = useRef<number | null>(null);

  const fetchToken = useCallback(async (): Promise<TokenResponse> => {
    const res = await fetch(`/api/sessions/${sessionId}/agora-token`);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? "token_failed");
    }
    return res.json();
  }, [sessionId]);

  // Duration ticker
  useEffect(() => {
    if (state !== "in-call") return;
    const t = setInterval(() => {
      if (joinedAtRef.current) {
        setElapsed(Math.floor((Date.now() - joinedAtRef.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(t);
  }, [state]);

  // Track browser fullscreen state
  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const join = useCallback(
    async (devices: DeviceSelection) => {
      setState("connecting");
      try {
        const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
        const token = await fetchToken();

        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        clientRef.current = client;

        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (mediaType === "audio") user.audioTrack?.play();
          setRemoteUsers([...client.remoteUsers]);
        });
        client.on("user-unpublished", () =>
          setRemoteUsers([...clientRef.current!.remoteUsers])
        );
        client.on("user-left", () =>
          setRemoteUsers([...clientRef.current!.remoteUsers])
        );
        client.on("token-privilege-will-expire", async () => {
          try {
            const fresh = await fetchToken();
            await client.renewToken(fresh.token);
          } catch {
            console.error("token renewal failed");
          }
        });

        await client.join(token.appId, token.channel, token.token, token.uid);

        const [micTrack, camTrack] = await Promise.all([
          AgoraRTC.createMicrophoneAudioTrack({
            microphoneId: devices.microphoneId,
          }),
          AgoraRTC.createCameraVideoTrack({ cameraId: devices.cameraId }),
        ]);
        micTrackRef.current = micTrack;
        camTrackRef.current = camTrack;

        await client.publish([micTrack, camTrack]);
        if (localVideoRef.current) camTrack.play(localVideoRef.current);

        joinedAtRef.current = Date.now();
        setState("in-call");
      } catch (err) {
        console.error("join failed:", err);
        const message = err instanceof Error ? err.message : "";
        setError(
          message === "outside_join_window"
            ? "The join window isn't open — it opens 15 minutes before the session."
            : "Couldn't connect to the session. Reload to try again."
        );
        setState("error");
      }
    },
    [fetchToken]
  );

  const leave = useCallback(async () => {
    micTrackRef.current?.close();
    camTrackRef.current?.close();
    await clientRef.current?.leave().catch(() => {});
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    setState("left");
    router.push(`/sessions/${sessionId}`);
  }, [router, sessionId]);

  useEffect(() => {
    return () => {
      micTrackRef.current?.close();
      camTrackRef.current?.close();
      clientRef.current?.leave().catch(() => {});
    };
  }, []);

  function toggleMic() {
    const next = !micOn;
    micTrackRef.current?.setEnabled(next);
    setMicOn(next);
  }
  function toggleCam() {
    const next = !camOn;
    camTrackRef.current?.setEnabled(next);
    setCamOn(next);
  }
  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      stageRef.current?.requestFullscreen().catch(() => {});
    }
  }

  const mins = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const secs = String(elapsed % 60).padStart(2, "0");

  if (state === "preflight") return <Preflight onReady={join} />;
  if (state === "connecting")
    return <p className="text-sm text-muted-foreground">Connecting…</p>;
  if (state === "error") return <p className="text-sm text-red-700">{error}</p>;
  if (state === "left") return null;

  const remote = remoteUsers[0];

  return (
    <div
      ref={stageRef}
      className="relative overflow-hidden rounded-2xl bg-[#0b1020]"
    >
      {/* Duration badge */}
      <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1">
        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        <span className="font-dm-sans text-xs text-white tabular-nums">
          {mins}:{secs}
        </span>
      </div>

      {/* Remote — full stage */}
      <div className="aspect-video w-full">
        {remote ? (
          <RemoteStage user={remote} name={counterpartName} />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <p className="font-dm-sans text-sm text-slate-400">
              Waiting for {counterpartName} to join…
            </p>
          </div>
        )}
      </div>

      {/* Self PiP */}
      <div className="absolute right-4 top-4 z-20 w-40 overflow-hidden rounded-xl border-2 border-white/20 bg-slate-900 shadow-lg sm:w-48">
        <div className="relative aspect-video">
          <div ref={localVideoRef} className="h-full w-full" />
          {!camOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
              <VideoOff size={16} className="text-slate-500" />
            </div>
          )}
          <span className="absolute bottom-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5 font-dm-sans text-[10px] text-white">
            You
          </span>
        </div>
      </div>

      {/* Floating controls */}
      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black/50 px-4 py-2.5 backdrop-blur">
        <ControlButton
          onClick={toggleMic}
          active={micOn}
          label={micOn ? "Mute" : "Unmute"}
        >
          {micOn ? <Mic size={18} /> : <MicOff size={18} />}
        </ControlButton>

        <button
          onClick={leave}
          title="Leave session"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white transition-colors hover:bg-red-700"
        >
          <PhoneOff size={18} />
        </button>

        <ControlButton
          onClick={toggleCam}
          active={camOn}
          label={camOn ? "Camera off" : "Camera on"}
        >
          {camOn ? <Video size={18} /> : <VideoOff size={18} />}
        </ControlButton>

        <ControlButton
          onClick={toggleFullscreen}
          active
          label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {fullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </ControlButton>
      </div>
    </div>
  );
}

function ControlButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
        active
          ? "bg-white/15 text-white hover:bg-white/25"
          : "bg-white text-slate-900 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function RemoteStage({
  user,
  name,
}: {
  user: IAgoraRTCRemoteUser;
  name: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current && user.videoTrack) user.videoTrack.play(ref.current);
    return () => user.videoTrack?.stop();
  }, [user.videoTrack]);
  return (
    <div className="relative h-full w-full">
      <div ref={ref} className="h-full w-full" />
      {!user.hasVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-dm-sans text-sm text-slate-400">
            {name}'s camera is off
          </p>
        </div>
      )}
      <span className="absolute bottom-3 left-3 rounded bg-black/60 px-2 py-1 font-dm-sans text-xs text-white">
        {name}
      </span>
    </div>
  );
}