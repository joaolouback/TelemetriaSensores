/** Aparência dos selos de conquista: ícone pelo tema da conquista e cor pela exigência. */
import { Ionicons } from '@expo/vector-icons';

type Icone = keyof typeof Ionicons.glyphMap;

const ICONES: { palavra: string; icone: Icone }[] = [
  { palavra: 'primeiro', icone: 'footsteps' },
  { palavra: 'explorador', icone: 'compass' },
  { palavra: 'conhecedor', icone: 'school' },
  { palavra: 'desafi', icone: 'flash' },
  { palavra: 'lenda', icone: 'trophy' },
  { palavra: 'coleciona', icone: 'diamond' },
];

/** O ícone sai do título da conquista; conquistas novas, sem ícone próprio, ganham uma medalha. */
export function iconeDaConquista(titulo: string): Icone {
  const t = titulo.toLowerCase();
  return ICONES.find((i) => t.includes(i.palavra))?.icone ?? 'ribbon';
}

/** Cores dos selos, do mais fácil ao mais difícil: bronze, prata, ouro e, depois, azul. */
const CORES_SELO = ['#B87333', '#8E98A8', '#C9A227', '#4C6EF5'];

export const corDoSelo = (posicao: number): string => CORES_SELO[Math.min(posicao, CORES_SELO.length - 1)];
