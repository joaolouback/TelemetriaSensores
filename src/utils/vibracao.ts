/**
 * Vibração (resposta tátil) dos momentos importantes do jogo.
 * Nunca lança erro: em aparelhos sem motor de vibração, simplesmente não acontece nada.
 */
import * as Haptics from 'expo-haptics';

const seguro = (p: Promise<void>) => p.catch(() => undefined);

/** Toque leve — trocar de aba, selecionar um ponto. */
export const vibrarSelecao = () => seguro(Haptics.selectionAsync());

/** Conquista: coletou o cristal, venceu o desafio. */
export const vibrarSucesso = () => seguro(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));

/** Algo deu errado: fora do raio, GPS falso, sem rede. */
export const vibrarErro = () => seguro(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
