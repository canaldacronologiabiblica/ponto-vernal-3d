export interface SimulationState {
  isPlaying: boolean;
  speed: number;
  showOrbits: boolean;
  showEclipticPlane: boolean;
  showEquatorPlane: boolean;
  showAxialTilt: boolean;
  showLabels: boolean;
  showNightDayShading: boolean;
  currentDayOfYear: number; // 0 a 365.2421875
  completedRevolutions: number; // Número de voltas completas ao redor do Sol
}
export interface SeasonInfo {
  name: string;
  hemisphereNorth: string;
  hemisphereSouth: string;
  dateRange: string;
  description: string;
}