"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

function buildProceduralEquirectangular(accent: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.55);
  sky.addColorStop(0, "#06070a");
  sky.addColorStop(1, "#12141c");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height * 0.55);

  const glow = ctx.createRadialGradient(
    canvas.width / 2, canvas.height * 0.5, 10,
    canvas.width / 2, canvas.height * 0.5, canvas.width * 0.4
  );
  glow.addColorStop(0, accent);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height * 0.6);
  ctx.globalAlpha = 1;

  const ground = ctx.createLinearGradient(0, canvas.height * 0.55, 0, canvas.height);
  ground.addColorStop(0, "#1c1f26");
  ground.addColorStop(1, "#0a0b0e");
  ctx.fillStyle = ground;
  ctx.fillRect(0, canvas.height * 0.55, canvas.width, canvas.height * 0.45);

  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 24; i++) {
    const x = (i / 24) * canvas.width;
    ctx.beginPath();
    ctx.moveTo(x, canvas.height * 0.55);
    ctx.lineTo(canvas.width / 2 + (x - canvas.width / 2) * 3, canvas.height);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(255,255,255,0.5)";
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height * 0.45;
    ctx.globalAlpha = Math.random() * 0.8;
    ctx.fillRect(x, y, 1.4, 1.4);
  }
  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function ProceduralSphere({ accent }: { accent: string }) {
  const texture = useMemo(() => buildProceduralEquirectangular(accent), [accent]);
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[50, 48, 32]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

function RealSphere({ url }: { url: string }) {
  const texture = useTexture(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.mapping = THREE.EquirectangularReflectionMapping;
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[50, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

export function Panorama({ url, accent }: { url?: string | null; accent: string }) {
  if (url) return <RealSphere url={url} />;
  return <ProceduralSphere accent={accent} />;
}
