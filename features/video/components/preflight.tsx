"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * P5-02 preflight — runs BEFORE joining the channel.
 * The #1 video support issue is blocked permissions: surface it as a clear
 * screen with instructions, never a spinner. On success, hands the chosen
 * device ids to the call room.
 */

export interface DeviceSelection {
  cameraId?: string;
  microphoneId?: string;
}

type PermissionState = "checking" | "granted" | "denied" | "no-devices";

export function Preflight({
  onReady,
}: {
  onReady: (devices: DeviceSelection) => void;
}) {
  const [state, setState] = useState<PermissionState>("checking");
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [cameraId, setCameraId] = useState<string>();
  const [microphoneId, setMicrophoneId] = useState<string>();

  useEffect(() => {
    (async () => {
      try {
        // Requesting a stream is what triggers the browser permission prompt;
        // stop the tracks immediately — Agora creates its own later.
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        stream.getTracks().forEach((t) => t.stop());

        const devices = await navigator.mediaDevices.enumerateDevices();
        const cams = devices.filter((d) => d.kind === "videoinput");
        const mics = devices.filter((d) => d.kind === "audioinput");

        if (cams.length === 0 && mics.length === 0) {
          setState("no-devices");
          return;
        }
        setCameras(cams);
        setMicrophones(mics);
        setCameraId(cams[0]?.deviceId);
        setMicrophoneId(mics[0]?.deviceId);
        setState("granted");
      } catch (err) {
        const name = (err as Error).name;
        setState(name === "NotFoundError" ? "no-devices" : "denied");
      }
    })();
  }, []);

  if (state === "checking") {
    return (
      <p className="text-sm text-muted-foreground">
        Checking camera and microphone…
      </p>
    );
  }

  if (state === "denied") {
    return (
      <Card className="space-y-3 p-6">
        <h2 className="font-serif text-lg">Camera and microphone blocked</h2>
        <p className="text-sm text-muted-foreground">
          Your browser has blocked access. Click the camera icon in the
          address bar (or padlock → site settings), allow camera and
          microphone for this site, then reload this page.
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reload after allowing
        </Button>
      </Card>
    );
  }

  if (state === "no-devices") {
    return (
      <Card className="space-y-3 p-6">
        <h2 className="font-serif text-lg">No camera or microphone found</h2>
        <p className="text-sm text-muted-foreground">
          Plug in or enable a camera/microphone and reload. On a work device,
          they may be disabled by policy — a personal device or phone works too.
        </p>
      </Card>
    );
  }

  return (
    <Card className="space-y-4 p-6">
      <h2 className="font-serif text-lg">Ready to join?</h2>

      {cameras.length > 1 && (
        <label className="grid gap-1 text-sm">
          Camera
          <select
            className="h-9 rounded-md border bg-transparent px-3 text-sm"
            value={cameraId}
            onChange={(e) => setCameraId(e.target.value)}
          >
            {cameras.map((c) => (
              <option key={c.deviceId} value={c.deviceId}>
                {c.label || "Camera"}
              </option>
            ))}
          </select>
        </label>
      )}

      {microphones.length > 1 && (
        <label className="grid gap-1 text-sm">
          Microphone
          <select
            className="h-9 rounded-md border bg-transparent px-3 text-sm"
            value={microphoneId}
            onChange={(e) => setMicrophoneId(e.target.value)}
          >
            {microphones.map((m) => (
              <option key={m.deviceId} value={m.deviceId}>
                {m.label || "Microphone"}
              </option>
            ))}
          </select>
        </label>
      )}

      <Button onClick={() => onReady({ cameraId, microphoneId })}>
        Join session
      </Button>
    </Card>
  );
}