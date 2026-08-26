"use client";

import { useMemo } from "react";

export interface ProceduralSpec {
  style: "villa" | "tower" | "bungalow" | "cabin" | "estate";
  accent: string;
  bedrooms: number;
}

function Windows({ width, height, depth, floors, accent }: { width: number; height: number; depth: number; floors: number; accent: string }) {
  const positions = useMemo(() => {
    const pts: [number, number, number, number][] = []; // x, y, z, rotationY
    const cols = Math.max(2, Math.round(width * 1.4));
    for (let f = 0; f < floors; f++) {
      const y = -height / 2 + (f + 0.6) * (height / floors);
      for (let c = 0; c < cols; c++) {
        const x = -width / 2 + ((c + 0.5) / cols) * width;
        pts.push([x, y, depth / 2 + 0.01, 0]);
        pts.push([x, y, -depth / 2 - 0.01, Math.PI]);
      }
    }
    return pts;
  }, [width, height, depth, floors]);

  return (
    <group>
      {positions.map((p, i) => (
        <mesh key={i} position={[p[0], p[1], p[2]]} rotation={[0, p[3], 0]}>
          <planeGeometry args={[0.35, 0.45]} />
          <meshStandardMaterial
            color="#0a0c10"
            emissive={accent}
            emissiveIntensity={Math.random() > 0.4 ? 0.8 : 0.15}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.8, 6]} />
        <meshStandardMaterial color="#3a2a1e" />
      </mesh>
      <mesh position={[0, 1, 0]}>
        <icosahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial color="#1f4d33" roughness={0.8} />
      </mesh>
    </group>
  );
}

/**
 * A stylized, fully generative building — the "beautiful fallback" for any
 * listing that doesn't have a real uploaded glTF scan yet. Zero external
 * assets, so it always renders. Shape/detail vary with style + bedroom
 * count so different listings don't look identical.
 */
export function ProceduralBuilding({ spec }: { spec: ProceduralSpec }) {
  const { style, accent, bedrooms } = spec;

  const width = 3.2 + Math.min(bedrooms, 5) * 0.35;
  const depth = 2.6 + Math.min(bedrooms, 5) * 0.2;
  const floors = style === "tower" ? 5 : style === "estate" ? 2 : style === "bungalow" || style === "cabin" ? 1 : 2;
  const height = floors * 1.4;

  const groundColor = style === "cabin" ? "#2b3a24" : "#233028";

  return (
    <group position={[0, -height / 2, 0]}>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[9, 48]} />
        <meshStandardMaterial color={groundColor} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <ringGeometry args={[3.6, 3.65, 64]} />
        <meshBasicMaterial color={accent} transparent opacity={0.35} />
      </mesh>

      {/* Main volume */}
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#12141a" roughness={0.5} metalness={0.3} />
      </mesh>
      <Windows width={width} height={height} depth={depth} floors={floors} accent={accent} />

      {/* Roof */}
      {style === "cabin" || style === "bungalow" ? (
        <mesh position={[0, height + 0.35, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[width * 0.85, 0.9, 4]} />
          <meshStandardMaterial color="#3a2a20" roughness={0.9} />
        </mesh>
      ) : (
        <mesh position={[0, height + 0.06, 0]}>
          <boxGeometry args={[width + 0.1, 0.12, depth + 0.1]} />
          <meshStandardMaterial color="#1a1c22" />
        </mesh>
      )}

      {/* Entrance glow */}
      <mesh position={[0, 0.55, depth / 2 + 0.02]}>
        <planeGeometry args={[0.8, 1.1]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.2} toneMapped={false} />
      </mesh>

      {style === "villa" && (
        <mesh position={[width / 2 + 1.6, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.2, 1.4]} />
          <meshStandardMaterial color="#0cb4db" emissive="#0cb4db" emissiveIntensity={0.4} />
        </mesh>
      )}

      {[...Array(5)].map((_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        const r = 5 + (i % 2) * 1.4;
        return <Tree key={i} position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]} />;
      })}
    </group>
  );
}
