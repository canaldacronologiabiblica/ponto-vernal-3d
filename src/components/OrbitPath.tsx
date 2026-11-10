import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ORBIT_RADIUS_X, ORBIT_RADIUS_Z, SEASONS_DATA } from '../constants';
import { Html } from '@react-three/drei';
interface OrbitPathProps {
  showEclipticPlane: boolean;
  onSelectStation: (deg: number) => void;
}
export const OrbitPath: React.FC<OrbitPathProps> = ({ showEclipticPlane, onSelectStation }) => {
  // Gera os pontos da elipse orbital
  const orbitPoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(
        new THREE.Vector3(
          Math.cos(theta) * ORBIT_RADIUS_X,
          0,
          Math.sin(theta) * ORBIT_RADIUS_Z
        )
      );
    }
    return points;
  }, []);
  const lineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(orbitPoints);
  }, [orbitPoints]);
  return (
    <group>
      {/* Linha contínua da órbita */}
      <primitive object={new THREE.Line(
        lineGeometry,
        new THREE.LineBasicMaterial({ color: 0x38bdf8, opacity: 0.45, transparent: true })
      )} />
      {/* Disco do Plano da Eclíptica */}
      {showEclipticPlane && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <ringGeometry args={[2.5, ORBIT_RADIUS_X * 1.08, 64]} />
          <meshBasicMaterial
            color="#0ea5e9"
            transparent
            opacity={0.05}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      {/* Marcadores dos 4 pontos cardeais da translação */}
      {SEASONS_DATA.map((season, idx) => {
        const rad = (season.angleDeg * Math.PI) / 180;
        const x = Math.cos(rad) * ORBIT_RADIUS_X;
        const z = Math.sin(rad) * ORBIT_RADIUS_Z;
        const isVernal = idx === 0;
        return (
          <group key={season.title} position={[x, 0, z]}>
            {/* Ponto âncora */}
            <mesh>
              <sphereGeometry args={[isVernal ? 0.12 : 0.08, 16, 16]} />
              <meshBasicMaterial color={isVernal ? '#10b981' : '#94a3b8'} />
            </mesh>
            {/* Marcador Html no piso orbital */}
            <Html position={[0, -0.4, 0]} center distanceFactor={14}>
              <button
                onClick={() => onSelectStation(season.angleDeg)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-wider transition-all backdrop-blur-md cursor-pointer whitespace-nowrap shadow-lg ${
                  isVernal
                    ? 'bg-emerald-950/80 border border-emerald-400 text-emerald-300 font-bold hover:bg-emerald-900/90'
                    : 'bg-slate-900/70 border border-slate-700/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {season.badge}
              </button>
            </Html>
          </group>
        );
      })}
    </group>
  );
};