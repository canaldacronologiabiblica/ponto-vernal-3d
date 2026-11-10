import React, { useMemo } from 'react';
import * as THREE from 'three';
export const Starfield: React.FC = () => {
  const [positions, colors] = useMemo(() => {
    const count = 1800;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 60 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
      // Tons sutis de estrelas azuis, brancas e âmbar
      const tint = Math.random();
      if (tint > 0.8) {
        col[i * 3] = 0.8;
        col[i * 3 + 1] = 0.9;
        col[i * 3 + 2] = 1.0;
      } else if (tint > 0.6) {
        col[i * 3] = 1.0;
        col[i * 3 + 1] = 0.9;
        col[i * 3 + 2] = 0.7;
      } else {
        col[i * 3] = 0.95;
        col[i * 3 + 1] = 0.95;
        col[i * 3 + 2] = 0.95;
      }
    }
    return [pos, col];
  }, []);
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);
  return (
    <primitive object={new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        size: 0.35,
        vertexColors: true,
        transparent: true,
        opacity: 0.85
      })
    )} />
  );
};