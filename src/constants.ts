export const EARTH_AXIAL_TILT_DEG = 23.44; // Graus de inclinação do eixo da Terra
export const ORBIT_RADIUS_X = 8.2;
export const ORBIT_RADIUS_Z = 7.6; // Leve elipse
export const TROPICAL_YEAR_DAYS = 365.2421875;
export const MAX_YEAR_AM = 6001;
/**
 * Formata um número com separador de milhar '.' e separador decimal ',' em padrão brasileiro
 * Mantém precisão decimal exata para os múltiplos de 365,2421875
 */
export function formatDaysPtBr(days: number): string {
  // Converte para string com até 7 casas decimais sem truncar zeros necessários
  const str = days.toFixed(7).replace(/\.?0+$/, '');
  const parts = str.split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  if (parts.length > 1 && parts[1].length > 0) {
    return `${integerPart},${parts[1]}`;
  }
  return integerPart;
}
/**
 * Retorna os dados completos do Equinócio Vernal de modo que o número da VOLTA seja exatamente igual ao ANO AM:
 * Volta 1: "EQUINÓCIO VERNAL", "ANO 01 AM" e "365,2421875 DIAS"
 * Volta 2: "EQUINÓCIO VERNAL", "ANO 02 AM" e "730,484375 DIAS"
 * Volta 3: "EQUINÓCIO VERNAL", "ANO 03 AM" e "1.095,7265625 DIAS"
 * Volta 4: "EQUINÓCIO VERNAL", "ANO 04 AM" e "1.460,96875 DIAS"
 * Volta 5: "EQUINÓCIO VERNAL", "ANO 05 AM" e "1.826,2109375 DIAS"
 * ... até ANO 6001 AM
 */
export function getVernalPointLabel(revolutions: number) {
  // Volta 0 corresponde ao instante inicial de criação / marco zero (0 DIAS)
  if (revolutions <= 0) {
    return {
      header: "PONTO VERNAL",
      primary: "MARCO ZERO",
      secondary: "INÍCIO",
      duration: "0 DIAS",
      daysValue: 0,
      yearNumber: 0,
      revolutionNumber: 0,
      astronomical: "Ponto Vernal Inicial (Ponto Áries ♈)",
      hemisphereNote: "Marco Zero de Referência Celestial (0 Dias)",
      coordinates: "Ascensão Reta: 0h 0m 0s | Declinação: 0° 0' 0\""
    };
  }
  const currentYearAM = Math.min(revolutions, MAX_YEAR_AM);
  const totalDays = currentYearAM * TROPICAL_YEAR_DAYS;
  const yearString = currentYearAM < 10 
    ? `ANO 0${currentYearAM} AM`
    : `ANO ${currentYearAM.toLocaleString('pt-BR')} AM`;
  return {
    header: "EQUINÓCIO VERNAL",
    primary: "PRIMAVERA",
    secondary: yearString,
    duration: `${formatDaysPtBr(totalDays)} DIAS`,
    daysValue: totalDays,
    yearNumber: currentYearAM,
    revolutionNumber: currentYearAM,
    astronomical: `Equinócio Vernal • Volta ${currentYearAM.toLocaleString('pt-BR')} (${yearString})`,
    hemisphereNote: `Retorno ao Equinócio Vernal na Volta ${currentYearAM.toLocaleString('pt-BR')} totalizando ${formatDaysPtBr(totalDays)} dias`,
    coordinates: "Ascensão Reta: 0h 0m 0s | Declinação: 0° 0' 0\""
  };
}
export const SEASONS_DATA = [
  {
    title: "Equinócio Vernal (Março)",
    badge: "0° • EQUINÓCIO",
    north: "Primavera",
    south: "Outono",
    date: "20 - 21 de Março",
    angleDeg: 0,
    desc: "O Sol cruza o equador celeste de sul para norte. Dias e noites têm duração rigorosamente igual (12 horas) em todo o planeta."
  },
  {
    title: "Solstício de Junho",
    badge: "90° de Translação",
    north: "Verão",
    south: "Inverno",
    date: "20 - 21 de Junho",
    angleDeg: 90,
    desc: "Dia mais longo do ano no Hemisfério Norte (Trópico de Câncer recebe luz solar zenital)."
  },
  {
    title: "Equinócio de Setembro",
    badge: "180° de Translação",
    north: "Outono",
    south: "Primavera",
    date: "22 - 23 de Setembro",
    angleDeg: 180,
    desc: "O Sol cruza o equador celeste de norte para sul. Igualdade global de dia e noite."
  },
  {
    title: "Solstício de Dezembro",
    badge: "270° de Translação",
    north: "Inverno",
    south: "Verão",
    date: "21 - 22 de Dezembro",
    angleDeg: 270,
    desc: "Noite mais longa no Hemisfério Norte e dia mais longo no Hemisfério Sul (Trópico de Capricórnio)."
  }
];