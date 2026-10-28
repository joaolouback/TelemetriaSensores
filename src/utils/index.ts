/** Funções utilitárias para cálculos matemáticos, formatação de dados e UI */
/**
 * m = sqrt(x² + y² + z²)
 */
export function calculateMagnitude(x: number, y: number, z: number): number {
  return Math.sqrt(x * x + y * y + z * z);
}


export function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}


/** "Maria da Silva" → "MS"; "Arthur" → "AR". */
export function obterIniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}


export function formatTimestamp(timestamp: number | string): string {
  const date = new Date(typeof timestamp === 'string' ? timestamp : timestamp);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}



export function formatNumber(value: number | null | undefined, decimals = 4): string {
  if (value === null || value === undefined) return '—';
  return value.toFixed(decimals);
}


export function formatBatteryLevel(level: number | null | undefined): string {
  if (level === null || level === undefined) return '—';
  return `${Math.round(level * 100)}%`;
}


export function getNetworkLabel(type: string | null): string {
  switch (type) {
    case 'wifi':
      return 'Wi-Fi';
    case 'cellular':
      return 'Dados Móveis';
    case 'none':
      return 'Offline';
    default:
      return 'Desconhecido';
  }
}


/** Raio médio da Terra em metros. */
const RAIO_TERRA_M = 6_371_000;

const paraRadianos = (graus: number): number => (graus * Math.PI) / 180;

/**
 * Distância em METROS entre duas coordenadas (fórmula de Haversine).
 * Mesma fórmula usada no backend (`src/utils/geo.ts`), replicada aqui para
 * que o app calcule proximidade offline, sem depender da API.
 */
export function distanciaEmMetros(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = paraRadianos(lat2 - lat1);
  const dLon = paraRadianos(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(paraRadianos(lat1)) *
      Math.cos(paraRadianos(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return RAIO_TERRA_M * c;
}

/** Formata uma distância em metros de forma legível (12 m / 1.4 km). */
export function formatDistancia(metros: number | null | undefined): string {
  if (metros === null || metros === undefined || Number.isNaN(metros)) return '—';
  if (metros < 1000) return `${Math.round(metros)} m`;
  return `${(metros / 1000).toFixed(2)} km`;
}
