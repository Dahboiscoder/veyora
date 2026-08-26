"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Center, useGLTF } from "@react-three/drei";
import { ProceduralBuilding, type ProceduralSpec } from "./ProceduralBuilding";
import { Panorama } from "./Panorama";
import { determineTourMode } from "./determineTourMode";
import type { PropertyCardMedia } from "@/types/property";

function isRealAsset(url: string | null | undefined): url is string {
  return !!url && /^https?:\/\//.test(url);
}

function RealModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return (
    <Center>
      <primitive object={scene} />
    </Center>
  );
}

function Loader() {
  return (
    <mesh>
      <torusGeometry args={[0.4, 0.08, 16, 48]} />
      <meshStandardMaterial color="#f96a1f" emissive="#f96a1f" emissiveIntensity={0.6} />
    </mesh>
  );
}

export function PropertyTourViewer({
  media,
  title,
}: {
  media: PropertyCardMedia[];
  title: string;
}) {
  const [interacted, setInteracted] = useState(false);
  const tour = determineTourMode(media);

  if (!tour) return null;

  const meta = (tour.asset as any).meta as ProceduralSpec | undefined;
  const spec: ProceduralSpec = meta?.style
    ? meta
    : { style: "villa", accent: "#f96a1f", bedrooms: 3 };

  return (
    <div className="relative h-full w-full bg-void-950">
      <Canvas
        dpr={[1, 1.8]}
        camera={{ position: [6, 3.5, 6], fov: 45 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#06070a"]} />
        {tour.mode === "model" ? (
          <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 8, 4]} intensity={1.1} castShadow />
            <pointLight position={[-6, 3, -4]} intensity={30} color={spec.accent} />
            <Suspense fallback={<Loader />}>
              {isRealAsset(tour.asset.url) ? <RealModel url={tour.asset.url} /> : <ProceduralBuilding spec={spec} />}
            </Suspense>
            <OrbitControls
              makeDefault
              enablePan={false}
              minDistance={3}
              maxDistance={16}
              maxPolarAngle={Math.PI / 2.05}
              autoRotate={!interacted}
              autoRotateSpeed={0.6}
              onStart={() => setInteracted(true)}
            />
          </>
        ) : (
          <>
            <ambientLight intensity={0.8} />
            <Suspense fallback={<Loader />}>
              <Panorama url={isRealAsset(tour.asset.url) ? tour.asset.url : undefined} accent={spec.accent} />
            </Suspense>
            <OrbitControls
              makeDefault
              enableZoom={false}
              enablePan={false}
              rotateSpeed={-0.35}
              autoRotate={!interacted}
              autoRotateSpeed={0.3}
              onStart={() => setInteracted(true)}
            />
          </>
        )}
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
        <div className="glass rounded-full px-4 py-2 text-xs text-white/70">
          {tour.mode === "model" ? "Drag to orbit · Scroll to zoom" : "Drag to look around"} — {title}
        </div>
      </div>
    </div>
  );
}
