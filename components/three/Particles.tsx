"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Points as ThreePoints } from "three";

// 老王说明：背景粒子/星空场
// - 在几何体后方铺一层缓慢漂浮的发光粒子，制造空间纵深与科技感
// - count 由设备分级控制：桌面密集，手机稀疏
// - 整体缓慢自转 + 轻微鼠标视差
interface ParticlesProps {
  count?: number;
}

export function Particles({ count = 1200 }: ParticlesProps) {
  const ref = useRef<ThreePoints>(null);

  // 老王说明：用确定性算法生成粒子坐标（不依赖 Math.random 的可复现写法），
  // 在一个球壳内均匀散布，避免聚成一团。
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    const golden = Math.PI * (3 - Math.sqrt(5)); // 黄金角，均匀分布
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const radius = 6 + (i % 7) * 0.9; // 分几层壳
      const y = 1 - t * 2; // -1 ~ 1
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      arr[i * 3] = Math.cos(theta) * r * radius;
      arr[i * 3 + 1] = y * radius * 0.6;
      arr[i * 3 + 2] = Math.sin(theta) * r * radius - 2;
    }
    return arr;
  }, [count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.03;
    // 轻微鼠标视差
    ref.current.rotation.x +=
      (state.pointer.y * 0.05 - ref.current.rotation.x) * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#A78BFA"
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
