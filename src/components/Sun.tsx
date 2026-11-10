import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
export const Sun: React.FC = () => {
  const coronaRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (coronaRef.current) {
      coronaRef.current.rotation.y += delta * 0.15;
      coronaRef.current.rotation.z += delta * 0.08;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.05;
    }
  });
  return (
    <group position={[0, 0, 0]}>
      {/* Luz central solar para iluminar a Terra fisicamente */}
      <pointLight intensity={35} distance={50} decay={1.5} color="#fff6d6" castShadow />
      <ambientLight intensity={0.12} color="#101827" />
      {/* Núcleo do Sol */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[1.5, 48, 48]} />
        <meshBasicMaterial color="#ffc107" />
      </mesh>
      {/* Camada incandescente externa (Corona) */}
      <mesh ref={coronaRef} scale={1.12}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial
          color="#ff7b00"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Halo brilhante */}
      <mesh scale={1.28}>
        <sphereGeometry args={[1.5, 24, 24]} />
        <meshBasicMaterial
          color="#ffa200"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};