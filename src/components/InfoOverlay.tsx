import React from 'react';
import { getVernalPointLabel, SEASONS_DATA, TROPICAL_YEAR_DAYS, formatDaysPtBr, MAX_YEAR_AM } from '../constants';
interface InfoOverlayProps {
  currentAngleDeg: number;
  completedRevolutions: number;
  isAtVernal: boolean;
  onResetToVernal: () => void;
  onGoToSeason: (deg: number) => void;
  onJumpToYear?: (yearAM: number) => void;
}
export const InfoOverlay: React.FC<InfoOverlayProps> = ({
  currentAngleDeg,
  completedRevolutions,
  isAtVernal,
  onResetToVernal,
  onGoToSeason,
  onJumpToYear,
}) => {
  const currentLabels = getVernalPointLabel(completedRevolutions);
  const elapsedDays = (completedRevolutions * TROPICAL_YEAR_DAYS) + ((currentAngleDeg / 360) * TROPICAL_YEAR_DAYS);
  const currentYearAM = Math.min(Math.max(completedRevolutions, 1), MAX_YEAR_AM);
  return (
    <div className="absolute top-4 left-4 z-20 max-w-sm flex flex-col gap-2.5 pointer-events-none">
      {/* Card Principal com status e rótulos progressivos */}
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3.5 shadow-2xl text-slate-100 pointer-events-auto">
        <div className="flex items-center justify-between gap-2 border-b border-slate-700/60 pb-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-emerald-400 text-lg">
              wb_twilight
            </span>
            <span className="font-mono text-xs uppercase tracking-wider text-emerald-300 font-bold">
              {currentLabels.header}
            </span>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
            isAtVernal 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
              : 'bg-slate-800 text-slate-400'
          }`}>
            {isAtVernal 
              ? `VOLTA ${completedRevolutions.toLocaleString('pt-BR')}` 
              : `${Math.round(currentAngleDeg)}° da Órbita`}
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-base font-black tracking-wide text-white flex items-center gap-1">
              {currentLabels.header}
            </h2>
            <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-700/80 shadow-sm">
              {currentLabels.secondary}
            </span>
          </div>
          {/* Destaque do tempo acumulado em DIAS solares tropicais */}
          <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">Total Acumulado:</span>
              <span className="text-xs font-mono font-black text-amber-300 tracking-wide">
                {isAtVernal
                  ? currentLabels.duration
                  : `${formatDaysPtBr(elapsedDays)} DIAS`}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Incremento por volta:</span>
              <span className="text-emerald-400 font-semibold">+365,2421875 DIAS</span>
            </div>
          </div>
          <p className="text-[11.5px] text-slate-300 leading-relaxed">
            {completedRevolutions >= 1
              ? `Volta ${completedRevolutions.toLocaleString('pt-BR')}: "${currentLabels.header}", "${currentLabels.secondary}" e "${currentLabels.duration}".`
              : "Posição inicial de referência. Clique em \"+1 Volta\" ou selecione o Ano AM para avançar com o incremento de 365,2421875 dias por volta até o ANO 6001 AM."}
          </p>
        </div>
        {/* Botão de Ponto Vernal */}
        <div className="mt-3 pt-2.5 border-t border-slate-800 flex gap-2">
          <button
            onClick={onResetToVernal}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition duration-200 cursor-pointer shadow-lg ${
              isAtVernal
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            <span className="material-symbols-outlined text-sm">my_location</span>
            {completedRevolutions >= 1 ? `Ver Equinócio Vernal (${currentLabels.secondary})` : "Ponto Vernal (0°)"}
          </button>
        </div>
      </div>
      {/* Saltos Rápidos de Anos Notáveis AM */}
      {onJumpToYear && (
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-2.5 text-xs pointer-events-auto">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 px-1 font-semibold flex items-center justify-between">
            <span>Saltos Rápidos AM:</span>
            <span className="text-cyan-300 font-mono">Ano: {currentYearAM}</span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {[1, 2, 3, 4, 10, 100, 4000, 6001].map((yr) => (
              <button
                key={yr}
                onClick={() => onJumpToYear(yr)}
                className={`py-1 px-1.5 rounded text-[10px] font-mono font-bold transition cursor-pointer text-center border ${
                  completedRevolutions === yr
                    ? 'bg-amber-500/30 border-amber-400 text-amber-200'
                    : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-700'
                }`}
                title={`Ir para Volta ${yr} / Ano ${yr} AM`}
              >
                {yr === 6001 ? '6001 AM' : yr === 4000 ? '4000 AM' : `Ano ${yr}`}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Marcadores de Estação Rápidos */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-2.5 text-xs pointer-events-auto">
        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 px-1 font-semibold flex items-center justify-between">
          <span>Estações da Translação:</span>
          <span className="text-emerald-400 font-mono">Volta: {completedRevolutions.toLocaleString('pt-BR')}</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {SEASONS_DATA.map((season) => {
            const isSelected = Math.abs(currentAngleDeg - season.angleDeg) < 3;
            return (
              <button
                key={season.title}
                onClick={() => onGoToSeason(season.angleDeg)}
                className={`p-1.5 rounded-lg text-left flex flex-col transition cursor-pointer border ${
                  isSelected
                    ? 'bg-indigo-600/30 border-indigo-400/80 text-white'
                    : 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="font-semibold text-[11px] truncate flex items-center justify-between">
                  {season.north}
                  <span className="text-[9px] font-mono text-amber-300">{season.angleDeg}°</span>
                </span>
                <span className="text-[10px] text-slate-400 truncate">{season.title.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};