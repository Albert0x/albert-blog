"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { FloatingShape } from "./FloatingShape";
import { Particles } from "./Particles";
import { useDeviceTier } from "@/lib/use-device-tier";

// 老王说明：首页 Hero 3D 场景（炫酷优先 + 手机自动降级）
// - 5 个自发光浮动几何体 + 背景粒子场，营造层次与纵深
// - 桌面端（high）：开 Bloom 辉光后处理 + 密集粒子 + 高 DPR
// - 手机/窄屏/减少动效（low）：关 Bloom、稀疏粒子、低 DPR，保证流畅
// - Three.js 依赖 WebGL，已通过 HeroSceneClient 的 dynamic(ssr:false) 接入
export function HeroScene() {
  const tier = useDeviceTier();
  const high = tier === "high";

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      dpr={high ? [1, 2] : [1, 1.25]} // 桌面更清晰，手机省电
      gl={{ antialias: true, alpha: true }}
      className="!absolute inset-0"
    >
      {/* 基础环境光 */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, -2, -2]} intensity={0.6} color="#8B5CF6" />
      <pointLight position={[5, 2, -2]} intensity={0.5} color="#06B6D4" />
      {/* 补一盏正面补光，替代原 HDR 环境的提亮作用 */}
      <pointLight position={[0, 0, 5]} intensity={0.5} color="#ffffff" />

      {/* 背景粒子场（桌面密集 / 手机稀疏） */}
      <Particles count={high ? 1400 : 450} />

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
          glow={high}
        />
        {/* 左上 - indigo 八面体（游走） */}
        <FloatingShape
          position={[-2.6, 1.3, -1]}
          geometry="octahedron"
          color="#6366F1"
          scale={0.7}
          speed={1.2}
          distort={0.25}
          rotationFactor={0.4}
          glow={high}
          wander
          wanderSeed={0.6}
        />
        {/* 右下 - cyan 圆环（游走） */}
        <FloatingShape
          position={[2.4, -1.2, -0.5]}
          geometry="torus"
          color="#06B6D4"
          scale={0.8}
          speed={0.9}
          rotationFactor={0.5}
          wireframe
          glow={high}
          wander
          wanderSeed={2.4}
        />
        {/* 右上 - 粉色十二面体（游走） */}
        <FloatingShape
          position={[2.8, 1.5, -1.5]}
          geometry="dodecahedron"
          color="#EC4899"
          scale={0.55}
          speed={1}
          distort={0.4}
          rotationFactor={0.35}
          glow={high}
          wander
          wanderSeed={3.9}
        />
        {/* 左下 - emerald 线框二十面体（游走） */}
        <FloatingShape
          position={[-2.4, -1.4, -1.2]}
          geometry="icosahedron"
          color="#10B981"
          scale={0.6}
          speed={1.3}
          rotationFactor={0.45}
          wireframe
          glow={high}
          wander
          wanderSeed={5.2}
        />
      </Suspense>

      {/* 后处理：辉光（Bloom）只在桌面端开，手机端关闭省 GPU */}
      {high && (
        <EffectComposer>
          <Bloom
            intensity={0.9}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.25} darkness={0.7} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
