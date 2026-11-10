import React from 'react';
import { SimulationState } from '../types';
import { MAX_YEAR_AM } from '../constants';
interface ControlsBarProps {
  state: SimulationState;
  onChange: (patch: Partial<SimulationState>) => void;
  onResetToVernal: () => void;
  onSimulateFullRevolution: () => void;
  onJumpToYear: (yearAM: number) => void;
  onSnapshot: () => void;
  isSaving: boolean;
}
export const ControlsBar: React.FC<ControlsBarProps> = ({
  state,
  onChange,
  onResetToVernal,
  onSimulateFullRevolution,
  onJumpToYear,
  onSnapshot,
  isSaving,
}) => {
  const currentYearAM = Math.min(Math.max(state.completedRevolutions, 1), MAX_YEAR_AM);
  return (
    <div className="absolute bottom-4 inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 z-20 pointer-events-auto">
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl px-4 py-3 shadow-2xl flex flex-wrap items-center justify-center gap-2.5 md:gap-3.5 text-slate-200 max-w-4xl">
        {/* Play / Pause e Vernal */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onChange({ isPlaying: !state.isPlaying })}
            className={`p-2.5 rounded-xl font-bold flex items-center justify-center transition shadow-md cursor-pointer ${
              state.isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
            }`}
            title={state.isPlaying ? 'Pausar Translação' : 'Iniciar Translação orbital'}
          >
            <span className="material-symbols-outlined text-xl">
              {state.isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>
          <button
            onClick={onResetToVernal}
            className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-mono font-semibold flex items-center gap-1 transition cursor-pointer"
            title="Travar no Equinócio Vernal (0°)"
          >
            <span className="material-symbols-outlined text-base text-emerald-400">my_location</span>
            Vernal
          </button>
        </div>
        {/* Botão de Incremento: +1 Volta / Ano (+365,24d) */}
        <div className="flex items-center gap-1 border-l border-slate-700/80 pl-2.5">
          <button
            onClick={onSimulateFullRevolution}
            className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/60 text-amber-300 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm active:scale-95"
            title="Adicionar 1 volta completa (+365,2421875 DIAS)"
          >
            <span className="material-symbols-outlined text-base text-amber-400">sync</span>
            +1 Volta (+365,24d)
          </button>
          {/* Seletor rápido de Volta / Ano AM */}
          <div className="flex items-center gap-1 bg-slate-950/70 border border-slate-800 rounded-xl px-2 py-1">
            <span className="text-[10px] font-mono text-slate-400">Volta/Ano:</span>
            <input
              type="number"
              min={1}
              max={MAX_YEAR_AM}
              value={currentYearAM}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 1 && val <= MAX_YEAR_AM) {
                  onJumpToYear(val);
                }
              }}
              className="w-16 bg-slate-900 text-amber-300 font-mono text-xs font-bold px-1.5 py-0.5 rounded border border-slate-700 text-center focus:outline-none focus:border-amber-400"
            />
            <span className="text-[10px] font-mono text-cyan-300 font-bold">AM</span>
          </div>
        </div>
        {/* Velocidade da Órbita */}
        <div className="flex items-center gap-1.5 border-l border-slate-700/80 pl-2.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase hidden sm:inline">Veloc.:</span>
          <input
            type="range"
            min="0.1"
            max="4"
            step="0.1"
            value={state.speed}
            onChange={(e) => onChange({ speed: parseFloat(e.target.value) })}
            className="w-16 md:w-20 accent-emerald-400 cursor-pointer"
          />
          <span className="font-mono text-xs text-emerald-300 w-7">
            {state.speed.toFixed(1)}x
          </span>
        </div>
        {/* Toggles Visuais */}
        <div className="flex items-center gap-1 border-l border-slate-700/80 pl-2.5">
          <button
            onClick={() => onChange({ showAxialTilt: !state.showAxialTilt })}
            className={`px-2 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer flex items-center gap-1 border ${
              state.showAxialTilt
                ? 'bg-sky-500/20 text-sky-300 border-sky-400/50'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Inclinação Axial da Terra (23.44°)"
          >
            <span className="material-symbols-outlined text-sm">straighten</span>
            <span className="hidden lg:inline">23.4°</span>
          </button>
          <button
            onClick={() => onChange({ showEclipticPlane: !state.showEclipticPlane })}
            className={`px-2 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer flex items-center gap-1 border ${
              state.showEclipticPlane
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Plano da Eclíptica"
          >
            <span className="material-symbols-outlined text-sm">layers</span>
            <span className="hidden lg:inline">Eclíptica</span>
          </button>
          <button
            onClick={() => onChange({ showLabels: !state.showLabels })}
            className={`px-2 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer flex items-center gap-1 border ${
              state.showLabels
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Exibir Legendas 3D"
          >
            <span className="material-symbols-outlined text-sm">label</span>
            <span className="hidden lg:inline">Legendas</span>
          </button>
        </div>
        {/* Capturar Imagem 3D */}
        <div className="border-l border-slate-700/80 pl-2.5">
          <button
            onClick={onSnapshot}
            disabled={isSaving}
            className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-lg shadow-indigo-600/30"
          >
            <span className="material-symbols-outlined text-base">photo_camera</span>
            <span className="hidden sm:inline">{isSaving ? 'Salvando...' : 'Capturar 3D'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};