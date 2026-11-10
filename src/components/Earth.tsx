import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { EARTH_AXIAL_TILT_DEG, getVernalPointLabel } from '../constants';
interface EarthProps {
  position: [number, number, number];
  isAtVernalPoint: boolean;
  completedRevolutions: number;
  showAxialTilt: boolean;
  showEquator: boolean;
  showLabels: boolean;
  onResetToVernal: () => void;
}
export const Earth: React.FC<EarthProps> = ({
  position,
  isAtVernalPoint,
  completedRevolutions,
  showAxialTilt,
  showEquator,
  showLabels,
  onResetToVernal,
}) => {
  const earthMeshRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  // Obtém dinamicamente o rótulo com Volta = Ano AM até 6001 AM
  const currentLabels = useMemo(() => {
    return getVernalPointLabel(completedRevolutions);
  }, [completedRevolutions]);
  // Rotação diurna da Terra
  useFrame((_, delta) => {
    if (earthMeshRef.current) {
      earthMeshRef.current.rotation.y += delta * 0.45;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.52;
    }
  });
  // Textura realista estilizada da Terra gerada programaticamente no canvas
  const earthTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    // Oceano profundo
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
    oceanGrad.addColorStop(0, '#0a2342');
    oceanGrad.addColorStop(0.5, '#124578');
    oceanGrad.addColorStop(1, '#0a2342');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, 1024, 512);
    // Linhas de latitude e longitude suaves
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= 1024; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(1024, 512);
      ctx.stroke();
    }
    for (let y = 0; y <= 512; y += 42) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }
    // Linha do Equador terrestre em destaque ciano
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 256);
    ctx.lineTo(1024, 256);
    ctx.stroke();
    // Silhuetas e massas continentais realistas
    ctx.fillStyle = '#2d6a4f';
    // Continente Eurásia e África
    ctx.beginPath();
    ctx.ellipse(560, 200, 140, 80, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#40916c';
    ctx.beginPath();
    ctx.ellipse(540, 290, 85, 95, -0.1, 0, Math.PI * 2);
    ctx.fill();
    // Américas (Norte e Sul)
    ctx.fillStyle = '#2d6a4f';
    ctx.beginPath();
    ctx.ellipse(260, 180, 95, 80, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#52b788';
    ctx.beginPath();
    ctx.ellipse(320, 320, 65, 105, 0.25, 0, Math.PI * 2);
    ctx.fill();
    // Austrália e Oceania
    ctx.fillStyle = '#74c69d';
    ctx.beginPath();
    ctx.ellipse(820, 340, 48, 38, 0, 0, Math.PI * 2);
    ctx.fill();
    // Calotas Polares
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 1024, 30);
    ctx.fillRect(0, 485, 1024, 27);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, []);
  // Textura atmosférica de nuvens
  const cloudsTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, 512, 256);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    for (let i = 0; i < 60; i++) {
      const rx = Math.random() * 512;
      const ry = 60 + Math.random() * 136;
      const rw = 25 + Math.random() * 60;
      const rh = 8 + Math.random() * 16;
      ctx.beginPath();
      ctx.ellipse(rx, ry, rw, rh, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
  }, []);
  const tiltRad = (EARTH_AXIAL_TILT_DEG * Math.PI) / 180;
  return (
    <group position={position}>
      {/* Grupo com a inclinação axial de 23.44° constante no espaço celeste */}
      <group rotation={[0, 0, -tiltRad]}>
        {/* Globo Terrestre */}
        <mesh ref={earthMeshRef} castShadow receiveShadow>
          <sphereGeometry args={[0.82, 64, 64]} />
          <meshStandardMaterial
            map={earthTexture}
            roughness={0.65}
            metalness={0.1}
          />
        </mesh>
        {/* Camada Atmosférica de Nuvens */}
        <mesh ref={cloudsRef} scale={1.025}>
          <sphereGeometry args={[0.82, 32, 32]} />
          <meshStandardMaterial
            map={cloudsTexture}
            transparent
            opacity={0.45}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        {/* Eixo de Rotação Terrestre */}
        {showAxialTilt && (
          <group>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 2.6, 16]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
            <mesh position={[0, 1.35, 0]}>
              <coneGeometry args={[0.07, 0.18, 16]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
            <mesh position={[0, -1.35, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.07, 0.18, 16]} />
              <meshBasicMaterial color="#0284c7" />
            </mesh>
          </group>
        )}
        {/* Plano do Equador Terrestre */}
        {showEquator && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.84, 1.05, 64]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.35}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>
      {/* Marcador e Rótulo Tridimensional no Ponto / Equinócio Vernal */}
      {showLabels && isAtVernalPoint && (
        <Html
          position={[0, 1.55, 0]}
          center
          distanceFactor={13}
          zIndexRange={[100, 0]}
        >
          <div className="flex flex-col items-center pointer-events-auto select-none animate-bounce duration-1000">
            <div className="relative group cursor-pointer" onClick={onResetToVernal}>
              <div className={`absolute -inset-1 rounded-xl blur-sm transition duration-300 ${
                completedRevolutions >= 1
                  ? 'bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 opacity-90 group-hover:opacity-100'
                  : 'bg-gradient-to-r from-emerald-500 via-amber-400 to-cyan-400 opacity-80 group-hover:opacity-100'
              }`}></div>
              
              <div className="relative px-4 py-2.5 bg-slate-950/95 border border-emerald-400/80 rounded-xl shadow-2xl backdrop-blur-md flex flex-col items-center gap-1.5 text-center min-w-[210px]">
                {/* 1. Header: "EQUINÓCIO VERNAL" */}
                <div className="flex items-center gap-1.5 text-[12px] font-mono tracking-widest text-emerald-300 font-black uppercase">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  {currentLabels.header}
                </div>
                
                {/* 2. Ano AM correspondente exato à volta: "ANO 01 AM", "ANO 02 AM", etc. */}
                <div className="text-[12px] font-mono font-bold tracking-widest text-cyan-300 bg-cyan-950/90 px-3 py-0.5 rounded border border-cyan-500/70 shadow-sm">
                  {currentLabels.secondary}
                </div>
                {/* 3. Duração acumulada com incremento de 365,2421875 DIAS a cada volta */}
                <div className="text-[13px] font-mono font-black text-amber-300 bg-amber-950/90 px-3 py-1 rounded border border-amber-500/80 shadow-inner tracking-wider">
                  {currentLabels.duration}
                </div>
              </div>
            </div>
            {/* Linha indicadora pontilhada conectando à Terra */}
            <div className="w-0.5 h-6 bg-gradient-to-b from-emerald-400 to-transparent"></div>
          </div>
        </Html>
      )}
    </group>
  );
};