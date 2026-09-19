/**
 * Hook de localização em tempo real para o mapa.
 *
 * Diferente de `useSensors` (que amostra a cada 30s para telemetria), aqui a
 * posição é atualizada a cada ~1s para o marcador se mover suavemente na tela.
 * Também acumula o trajeto percorrido para desenhar a Polyline.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { LocationData, PontoTrajeto } from '../types';
import {
  MAP_LOCATION_INTERVAL_MS,
  MAP_DISTANCE_INTERVAL_M,
  MAX_PONTOS_TRAJETO,
} from '../constants';

type PermissaoStatus = 'indefinida' | 'concedida' | 'negada';

export function useLiveLocation(ativo: boolean = true) {
  const [localizacao, setLocalizacao] = useState<LocationData | null>(null);
  const [trajeto, setTrajeto] = useState<PontoTrajeto[]>([]);
  const [permissao, setPermissao] = useState<PermissaoStatus>('indefinida');
  const [erro, setErro] = useState<string | null>(null);

  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const limparTrajeto = useCallback(() => setTrajeto([]), []);

  useEffect(() => {
    let cancelado = false;

    async function iniciar() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (cancelado) return;

        if (status !== 'granted') {
          setPermissao('negada');
          setErro('Permissão de localização negada. Libere o acesso nas configurações do aparelho.');
          return;
        }

        setPermissao('concedida');
        setErro(null);

        // Posição inicial imediata, para o mapa não abrir vazio enquanto
        // o watchPositionAsync ainda não emitiu a primeira leitura.
        try {
          const atual = await Location.getLastKnownPositionAsync();
          if (atual && !cancelado) {
            setLocalizacao({
              latitude: atual.coords.latitude,
              longitude: atual.coords.longitude,
              accuracy: atual.coords.accuracy,
              timestamp: atual.timestamp,
            });
          }
        } catch {
          // Sem última posição conhecida — seguimos para o watch normalmente.
        }

        if (cancelado) return;

        subscriptionRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: MAP_LOCATION_INTERVAL_MS,
            distanceInterval: MAP_DISTANCE_INTERVAL_M,
          },
          (posicao) => {
            const dados: LocationData = {
              latitude: posicao.coords.latitude,
              longitude: posicao.coords.longitude,
              accuracy: posicao.coords.accuracy,
              timestamp: posicao.timestamp,
            };

            setLocalizacao(dados);
            setTrajeto((anterior) => {
              const novo = [
                ...anterior,
                { latitude: dados.latitude, longitude: dados.longitude },
              ];
              // Mantém o array limitado para não pesar o render do mapa.
              return novo.length > MAX_PONTOS_TRAJETO
                ? novo.slice(novo.length - MAX_PONTOS_TRAJETO)
                : novo;
            });
          }
        );
      } catch (e) {
        if (!cancelado) {
          console.error('[useLiveLocation] Erro ao iniciar rastreamento:', e);
          setErro('Não foi possível iniciar o rastreamento de localização.');
        }
      }
    }

    if (ativo) {
      iniciar();
    }

    return () => {
      cancelado = true;
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, [ativo]);

  return { localizacao, trajeto, permissao, erro, limparTrajeto };
}
