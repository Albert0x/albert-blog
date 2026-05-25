"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, MeshWobbleMaterial } from "@react-three/drei";
import type { Mesh } from "three";

// 老王说明：单个浮动几何体
// 配合 drei 的 Float 实现持续漂浮，材质用 MeshDistortMaterial（液态扭曲）或 MeshWobble
// 鼠标位置（通过 useFrame 内的 state.pointer）做轻微视差响应
interface FloatingShapeProps {
  position: [number, number, number];
  geometry?: "icosahedron" | "octahedron" | "torus" | "sphere" | "dodecahedron";
  color: string;
  scale?: number;
  speed?: number;
  distort?: number;
  wireframe?: boolean;
  rotationFactor?: number;
}

export function FloatingShape({
  position,
  geometry = "icosahedron",
  color,
  scale = 1,
  speed = 1,
  distort = 0.3,
  wireframe = false,
  rotationFactor = 0.2,
}: FloatingShapeProps) {
  const meshRef = useRef<Mesh>(null);

  // 老王说明：每帧根据鼠标位置轻微偏移，制造视差感
  useFrame((state) => {
    if (!meshRef.current) return;
    const { pointer } = state;
    // pointer 是 -1 ~ 1 的归一化坐标，乘以小系数避免动得过猛
    meshRef.current.rotation.x += 0.002 * speed;
    meshRef.current.rotation.y += 0.003 * speed;
    // 视差跟随
    meshRef.current.position.x = position[0] + pointer.x * rotationFactor;
    meshRef.current.position.y = position[1] - pointer.y * rotationFactor;
  });

  // 老王说明：根据 geometry 字段选择几何体
  const geo = (() => {
    switch (geometry) {
      case "octahedron":
        return <octahedronGeometry args={[1, 0]} />;
      case "torus":
        return <torusGeometry args={[0.7, 0.3, 16, 64]} />;
      case "sphere":
        return <sphereGeometry args={[1, 64, 64]} />;
      case "dodecahedron":
        return <dodecahedronGeometry args={[1, 0]} />;
      case "icosahedron":
      default:
        return <icosahedronGeometry args={[1, 1]} />;
    }
  })();

  return (
    <Float speed={speed * 2} rotationIntensity={0.4} floatIntensity={1.2}>
      <mesh ref={meshRef} position={position} scale={scale}>
        {geo}
        {wireframe ? (
          <MeshWobbleMaterial
            color={color}
            wireframe
            factor={0.6}
            speed={speed}
            transparent
            opacity={0.6}
          />
        ) : (
          <MeshDistortMaterial
            color={color}
            distort={distort}
            speed={speed * 1.5}
            roughness={0.2}
            metalness={0.6}
            transparent
            opacity={0.85}
          />
        )}
      </mesh>
    </Float>
  );
}
