"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { FloatingShape } from "./FloatingShape";

// 老王说明：首页 Hero 3D 场景
// - 5 个浮动几何体（不同形状 / 颜色 / 位置 / 速度）营造层次感
// - Environment preset 提供 HDR 环境光，让金属材质更通透
// - Suspense 保护 + Environment 异步加载，避免阻塞首屏
// - 鼠标视差通过子组件的 useFrame + pointer 实现
export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      dpr={[1, 1.5]} // 限制最大像素比，性能优先
      gl={{ antialias: true, alpha: true }}
      className="!absolute inset-0"
    >
      {/* 基础环境光 */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, -2, -2]} intensity={0.6} color="#8B5CF6" />
      <pointLight position={[5, 2, -2]} intensity={0.5} color="#06B6D4" />

      {/* HDR 环境（让金属材质有反射感） */}
      <Suspense fallback={null}>
        <Environment preset="city" />
      </Suspense>

      {/* 浮动几何体阵列 */}
      <Suspense fallback={null}>
        {/* 中央大球 - 品牌主紫色 */}
        <FloatingShape
          position={[0, 0, 0]}
          geometry="icosahedron"
          color="#8B5CF6"
          scale={1.4}
          speed={0.6}
          distort={0.35}
          rotationFactor={0.3}
        />
        {/* 左上 - indigo 八面体 */}
        <FloatingShape
          position={[-2.6, 1.3, -1]}
          geometry="octahedron"
          color="#6366F1"
          scale={0.7}
          speed={1.2}
          distort={0.25}
          rotationFactor={0.4}
        />
        {/* 右下 - cyan 圆环 */}
        <FloatingShape
          position={[2.4, -1.2, -0.5]}
          geometry="torus"
          color="#06B6D4"
          scale={0.8}
          speed={0.9}
          rotationFactor={0.5}
          wireframe
        />
        {/* 右上 - 粉色十二面体 */}
        <FloatingShape
          position={[2.8, 1.5, -1.5]}
          geometry="dodecahedron"
          color="#EC4899"
          scale={0.55}
          speed={1}
          distort={0.4}
          rotationFactor={0.35}
        />
        {/* 左下 - emerald 线框二十面体 */}
        <FloatingShape
          position={[-2.4, -1.4, -1.2]}
          geometry="icosahedron"
          color="#10B981"
          scale={0.6}
          speed={1.3}
          rotationFactor={0.45}
          wireframe
        />
      </Suspense>
    </Canvas>
  );
}
