"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, MeshWobbleMaterial } from "@react-three/drei";
import type { Mesh } from "three";

// 老王说明：单个浮动几何体
// 两种运动模式：
//  - 默认：固定位置 + 鼠标视差（中央大球用）
//  - wander：在可视窗口内随机游走，碰到边缘反弹（DVD 屏保效果，4 个小物体用）
interface FloatingShapeProps {
  position: [number, number, number];
  geometry?: "icosahedron" | "octahedron" | "torus" | "sphere" | "dodecahedron";
  color: string;
  scale?: number;
  speed?: number;
  distort?: number;
  wireframe?: boolean;
  rotationFactor?: number;
  /** 是否增强自发光，让 Bloom 后处理产生辉光（桌面端开） */
  glow?: boolean;
  /** 开启「窗口内随机游走 + 碰边反弹」 */
  wander?: boolean;
  /** 游走初始方向种子（弧度），让每个物体方向各异 */
  wanderSeed?: number;
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
  glow = false,
  wander = false,
  wanderSeed = 0,
}: FloatingShapeProps) {
  const meshRef = useRef<Mesh>(null);

  // 老王说明：游走状态 - 当前坐标 + 速度向量（仅 wander 模式用）
  // 初始速度由 wanderSeed 决定方向，base 控制基础速度（世界单位/秒）
  const wanderRef = useRef({
    x: position[0],
    y: position[1],
    vx: Math.cos(wanderSeed) * 0.9 * speed,
    vy: Math.sin(wanderSeed) * 0.9 * speed,
  });

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    // 自转
    meshRef.current.rotation.x += 0.002 * speed;
    meshRef.current.rotation.y += 0.003 * speed;

    if (wander) {
      // 老王说明：碰边反弹
      // 用当前 viewport（z=0 平面的可视宽高，世界单位）算边界，
      // 留出 margin（物体半径 + 余量）避免物体飞出画面一半
      const s = wanderRef.current;
      const d = Math.min(delta, 0.05); // 防止切后台回来跳一大步
      s.x += s.vx * d;
      s.y += s.vy * d;

      const margin = scale + 0.4;
      const halfW = state.viewport.width / 2 - margin;
      const halfH = state.viewport.height / 2 - margin;

      if (s.x > halfW) {
        s.x = halfW;
        s.vx = -Math.abs(s.vx);
      } else if (s.x < -halfW) {
        s.x = -halfW;
        s.vx = Math.abs(s.vx);
      }
      if (s.y > halfH) {
        s.y = halfH;
        s.vy = -Math.abs(s.vy);
      } else if (s.y < -halfH) {
        s.y = -halfH;
        s.vy = Math.abs(s.vy);
      }

      // 叠加轻微鼠标视差
      meshRef.current.position.x = s.x + state.pointer.x * rotationFactor * 0.5;
      meshRef.current.position.y = s.y - state.pointer.y * rotationFactor * 0.5;
    } else {
      // 默认：固定位置 + 鼠标视差
      const { pointer } = state;
      meshRef.current.position.x = position[0] + pointer.x * rotationFactor;
      meshRef.current.position.y = position[1] - pointer.y * rotationFactor;
    }
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
            emissive={color}
            emissiveIntensity={glow ? 1.2 : 0.4}
          />
        ) : (
          <MeshDistortMaterial
            color={color}
            distort={distort}
            speed={speed * 1.5}
            roughness={0.35}
            metalness={0.25}
            transparent
            opacity={0.9}
            emissive={color}
            emissiveIntensity={glow ? 0.9 : 0.35}
          />
        )}
      </mesh>
    </Float>
  );
}
