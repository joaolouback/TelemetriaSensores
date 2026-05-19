/**
 * m = sqrt(x² + y² + z²)
 */
export function calculateMagnitude(x: number, y: number, z: number): number {
  return Math.sqrt(x * x + y * y + z * z);
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
