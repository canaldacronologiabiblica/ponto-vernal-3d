import React, { useState, useRef, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Flow } from 'flow-sdk';
import { Sun } from './components/Sun';
import { Earth } from './components/Earth';
import { OrbitPath } from './components/OrbitPath';
import { Starfield } from './components/Starfield';
import { InfoOverlay } from './components/InfoOverlay';
import { ControlsBar } from './components/ControlsBar';
import { SimulationState } from './types';
import { ORBIT_RADIUS_X, ORBIT_RADIUS_Z, getVernalPointLabel, MAX_YEAR_AM } from './constants';
// Controlador da física e translação orbital com sincronização precisa do ano e da volta
const OrbitalEngine: React.FC<{
  state: SimulationState;
  orbitAngleRef: React.MutableRefObject<number>;
  completedRevolutionsRef: React.MutableRefObject<number>;
  onAngleChange: (deg: number, completedRevs: number) => void;
  targetAngleRef: React.MutableRefObject<number | null>;
  onResetToVernal: () => void;
}> = ({
  state,
  orbitAngleRef,
  completedRevolutionsRef,
  onAngleChange,
  targetAngleRef,
  onResetToVernal,
}) => {
  useFrame((_, delta) => {
    // Transição / animação suave ao navegar diretamente para um ângulo de estação
    if (targetAngleRef.current !== null) {
      const targetRad = (targetAngleRef.current * Math.PI) / 180;
      const currentNorm = orbitAngleRef.current % (Math.PI * 2);
      let diff = targetRad - currentNorm;
      
      // Menor caminho angular
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      if (Math.abs(diff) > 0.015) {
        const step = diff * Math.min(delta * 5.0, 0.3);
        orbitAngleRef.current += step;
      } else {
        orbitAngleRef.current = targetRad;
        targetAngleRef.current = null;
      }
      const normalizedRad = ((orbitAngleRef.current % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
      const deg = (normalizedRad * 180) / Math.PI;
      onAngleChange(deg, completedRevolutionsRef.current);
      return;
    }
    // Movimento orbital contínuo quando a simulação está reproduzindo (Play)
    if (state.isPlaying) {
      const prevAngle = orbitAngleRef.current;
      const orbitSpeed = delta * 0.28 * state.speed;
      const nextAngle = prevAngle + orbitSpeed;
      orbitAngleRef.current = nextAngle;
      // Detecta quando completa uma volta inteira (cruza o marco zero / 2PI)
      const prevLaps = Math.floor(prevAngle / (Math.PI * 2));
      const nextLaps = Math.floor(nextAngle / (Math.PI * 2));
      if (nextLaps > prevLaps) {
        completedRevolutionsRef.current = Math.min(
          completedRevolutionsRef.current + (nextLaps - prevLaps),
          MAX_YEAR_AM
        );
      }
      const normalizedRad = ((nextAngle % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
      const deg = (normalizedRad * 180) / Math.PI;
      onAngleChange(deg, completedRevolutionsRef.current);
    }
  });
  const normalizedRad = ((orbitAngleRef.current % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
  const x = Math.cos(normalizedRad) * ORBIT_RADIUS_X;
  const z = Math.sin(normalizedRad) * ORBIT_RADIUS_Z;
  const currentDeg = (normalizedRad * 180) / Math.PI;
  // Ponto vernal na vizinhança de 0° / 360°
  const isAtVernal = currentDeg <= 8 || currentDeg >= 352;
  return (
    <group>
      <Earth
        position={[x, 0, z]}
        isAtVernalPoint={isAtVernal}
        completedRevolutions={completedRevolutionsRef.current}
        showAxialTilt={state.showAxialTilt}
        showEquator={state.showEquatorPlane}
        showLabels={state.showLabels}
        onResetToVernal={onResetToVernal}
      />
    </group>
  );
};
export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orbitAngleRef = useRef<number>(0); // Ângulo orbital atual em radianos
  const completedRevolutionsRef = useRef<number>(1); // Mantém com precisão o ano/volta atual
  const targetAngleRef = useRef<number | null>(null);
  const [currentAngleDeg, setCurrentAngleDeg] = useState<number>(0);
  const [completedRevolutions, setCompletedRevolutions] = useState<number>(1);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [simState, setSimState] = useState<SimulationState>({
    isPlaying: false,
    speed: 1,
    showOrbits: true,
    showEclipticPlane: true,
    showEquatorPlane: true,
    showAxialTilt: true,
    showLabels: true,
    showNightDayShading: true,
    currentDayOfYear: 0,
    completedRevolutions: 1,
  });
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };
  const handleAngleUpdate = useCallback((deg: number, completedRevs: number) => {
    setCurrentAngleDeg(deg);
    if (completedRevs !== completedRevolutionsRef.current || completedRevs !== completedRevolutions) {
      completedRevolutionsRef.current = completedRevs;
      setCompletedRevolutions(completedRevs);
      setSimState(prev => ({ ...prev, completedRevolutions: completedRevs }));
      const labels = getVernalPointLabel(completedRevs);
      showToast(`🌟 Volta ${completedRevs.toLocaleString('pt-BR')}: "${labels.header}", "${labels.secondary}" e "${labels.duration}"`);
    }
  }, [completedRevolutions]);
  const handleStateChange = (patch: Partial<SimulationState>) => {
    setSimState((prev) => ({ ...prev, ...patch }));
  };
  const handleResetToVernal = useCallback(() => {
    targetAngleRef.current = 0;
    orbitAngleRef.current = 0;
    setCurrentAngleDeg(0);
    handleStateChange({ isPlaying: false });
    const labels = getVernalPointLabel(completedRevolutionsRef.current);
    showToast(`Posicionado no ${labels.header}: "${labels.secondary}" e "${labels.duration}"`);
  }, []);
  const handleGoToSeason = useCallback((deg: number) => {
    targetAngleRef.current = deg;
    handleStateChange({ isPlaying: false });
  }, []);
  // Incremento de 1 volta completa: Volta N -> Volta N+1 (+365,2421875 dias)
  const handleSimulateFullRevolution = useCallback(() => {
    const nextRevs = Math.min(completedRevolutionsRef.current + 1, MAX_YEAR_AM);
    completedRevolutionsRef.current = nextRevs;
    orbitAngleRef.current = 0;
    targetAngleRef.current = 0;
    setCurrentAngleDeg(0);
    setCompletedRevolutions(nextRevs);
    setSimState(prev => ({ ...prev, isPlaying: false, completedRevolutions: nextRevs }));
    const labels = getVernalPointLabel(nextRevs);
    showToast(`✓ Volta ${nextRevs}: "${labels.header}", "${labels.secondary}" e "${labels.duration}"`);
  }, []);
  // Salto direto para qualquer ano AM (ex: 4000 AM = 1.460.968,75 dias)
  const handleJumpToYear = useCallback((targetYearAM: number) => {
    const clampedYear = Math.max(1, Math.min(targetYearAM, MAX_YEAR_AM));
    completedRevolutionsRef.current = clampedYear;
    orbitAngleRef.current = 0;
    targetAngleRef.current = 0;
    setCurrentAngleDeg(0);
    setCompletedRevolutions(clampedYear);
    setSimState(prev => ({ ...prev, isPlaying: false, completedRevolutions: clampedYear }));
    const labels = getVernalPointLabel(clampedYear);
    showToast(`✓ Salto para o ${labels.secondary}: ${labels.duration}`);
  }, []);
  // Captura WebGL preservando desenho
  const handleSnapshot = async () => {
    if (!canvasRef.current) return;
    setIsSaving(true);
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const base64 = dataUrl.split(',')[1];
      const labels = getVernalPointLabel(completedRevolutionsRef.current);
      const name = `Equinocio_Vernal_${labels.secondary.replace(/[^a-zA-Z0-9]/g, '_')}_${labels.duration.replace(/[^a-zA-Z0-9]/g, '_')}`;
      await Flow.save({
        base64,
        mimeType: 'image/png',
        name,
      });
      showToast("✓ Imagem 3D salva na Galeria com as legendas do ano atual!");
    } catch (err) {
      console.error(err);
      showToast("Falha ao salvar renderização.");
    } finally {
      setIsSaving(false);
    }
  };
  const isAtVernal = currentAngleDeg <= 8 || currentAngleDeg >= 352;
  const currentLabels = getVernalPointLabel(completedRevolutions);
  return (
    <div className="relative w-full h-screen bg-[#07090e] overflow-hidden select-none font-sans">
      {/* Toast Flutuante */}
      {toastMessage && (
        <div className="absolute top-4 right-4 z-50 max-w-md px-4 py-2.5 bg-emerald-500/95 text-slate-950 font-bold text-xs rounded-xl shadow-2xl backdrop-blur-md animate-fade-in flex items-center gap-2 border border-emerald-300">
          <span className="material-symbols-outlined text-lg">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}
      {/* Painel Informativo Lateral com status e saltos AM */}
      <InfoOverlay
        currentAngleDeg={currentAngleDeg}
        completedRevolutions={completedRevolutions}
        isAtVernal={isAtVernal}
        onResetToVernal={handleResetToVernal}
        onGoToSeason={handleGoToSeason}
        onJumpToYear={handleJumpToYear}
      />
      {/* Top Banner de Identificação da Translação */}
      <div className="absolute top-4 right-4 md:right-auto md:left-1/2 md:-translate-x-1/2 z-10 pointer-events-none">
        <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800/80 px-4 py-1.5 rounded-full flex items-center gap-2.5 shadow-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-emerald-400 shadow-sm animate-pulse"></span>
          <span className="text-xs font-mono font-bold tracking-widest text-slate-300">
            VOLTA {completedRevolutions.toLocaleString('pt-BR')}: "{currentLabels.header}", "{currentLabels.secondary}" e "{currentLabels.duration}"
          </span>
        </div>
      </div>
      {/* Cena 3D Three.js */}
      <Canvas
        ref={canvasRef}
        camera={{ position: [8, 12, 16], fov: 45 }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.05}
          maxDistance={38}
          minDistance={3}
        />
        <Starfield />
        <Sun />
        <OrbitPath
          showEclipticPlane={simState.showEclipticPlane}
          onSelectStation={handleGoToSeason}
        />
        <OrbitalEngine
          state={simState}
          orbitAngleRef={orbitAngleRef}
          completedRevolutionsRef={completedRevolutionsRef}
          onAngleChange={handleAngleUpdate}
          targetAngleRef={targetAngleRef}
          onResetToVernal={handleResetToVernal}
        />
      </Canvas>
      {/* Barra de Controles Inferior */}
      <ControlsBar
        state={simState}
        onChange={handleStateChange}
        onResetToVernal={handleResetToVernal}
        onSimulateFullRevolution={handleSimulateFullRevolution}
        onJumpToYear={handleJumpToYear}
        onSnapshot={handleSnapshot}
        isSaving={isSaving}
      />
    </div>
  );
}