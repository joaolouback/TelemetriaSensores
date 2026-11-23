/**
 * Ponto de interesse no mapa: a foto do local num círculo (ou um ícone, se ainda não houver
 * foto), com a borda na cor do estado e uma ponta marcando o lugar exato. Acompanha a área de
 * coleta (geofence) desenhada em camadas: um halo no centro e a borda do raio.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Marker, Circle } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { urlDoServidor } from '../utils/url';
import type { PontoComDistancia } from '../types';

export type EstadoPonto = 'normal' | 'desafio' | 'noRaio' | 'coletado';

interface Props {
  ponto: PontoComDistancia;
  estado: EstadoPonto;
  /** Cor do estado (borda da foto, ponta e área de coleta). */
  cor: string;
  titulo: string;
  descricao: string;
  onPress: () => void;
}

const TAMANHO_FOTO = 42;

/** '#3B5BDB' + 0.2 → 'rgba(59, 91, 219, 0.2)'. */
function comAlfa(hex: string, alfa: number): string {
  const n = parseInt(hex.replace('#', '').slice(0, 6), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alfa})`;
}

/** Intensidade da área de coleta em cada estado: mais forte quando o jogador está dentro. */
const AREA: Record<EstadoPonto, { borda: number; espessura: number; fundo: number; halo: number }> = {
  normal: { borda: 0.6, espessura: 1.5, fundo: 0.07, halo: 0.1 },
  desafio: { borda: 0.85, espessura: 2.5, fundo: 0.1, halo: 0.14 },
  noRaio: { borda: 1, espessura: 3, fundo: 0.18, halo: 0.2 },
  coletado: { borda: 0.45, espessura: 1, fundo: 0.05, halo: 0 },
};

const SELO: Partial<Record<EstadoPonto, keyof typeof Ionicons.glyphMap>> = {
  coletado: 'checkmark',
  desafio: 'flash',
  noRaio: 'scan',
};

export function AreaPonto({ ponto, estado, cor }: Pick<Props, 'ponto' | 'estado' | 'cor'>) {
  const area = AREA[estado];
  const centro = { latitude: ponto.latitude, longitude: ponto.longitude };
  return (
    <>
      <Circle
        center={centro}
        radius={ponto.raioGeofence}
        strokeWidth={area.espessura}
        strokeColor={comAlfa(cor, area.borda)}
        fillColor={comAlfa(cor, area.fundo)}
      />
      {area.halo > 0 && (
        // Halo no centro: dá a sensação de gradiente e destaca onde fica o ponto.
        <Circle
          center={centro}
          radius={ponto.raioGeofence * 0.45}
          strokeWidth={0}
          strokeColor="transparent"
          fillColor={comAlfa(cor, area.halo)}
        />
      )}
    </>
  );
}

export function MarcadorPonto({ ponto, estado, cor, titulo, descricao, onPress }: Props) {
  const foto = ponto.imagemUrl ? urlDoServidor(ponto.imagemUrl) : null;
  const [falhou, setFalhou] = useState(false);

  // Android: o marcador é uma "foto" da view. Redesenha até a imagem carregar (ou trocar de
  // estado) e então congela, para não ficar em branco nem redesenhar a cada leitura do GPS.
  const [redesenhar, setRedesenhar] = useState(true);
  useEffect(() => setRedesenhar(true), [foto, estado, cor, falhou]);
  const pronto = useCallback(() => {
    setTimeout(() => setRedesenhar(false), 300);
  }, []);
  const usaFoto = Boolean(foto) && !falhou;
  useEffect(() => {
    if (!usaFoto) pronto();
  }, [usaFoto, pronto, estado, cor]);

  const selo = SELO[estado];

  return (
    <Marker
      coordinate={{ latitude: ponto.latitude, longitude: ponto.longitude }}
      anchor={{ x: 0.5, y: 1 }}
      tracksViewChanges={redesenhar}
      zIndex={estado === 'desafio' || estado === 'noRaio' ? 10 : 1}
      title={titulo}
      description={descricao}
      onPress={onPress}
    >
      <View style={styles.conteudo}>
        <View style={[styles.moldura, { borderColor: cor }, estado === 'coletado' && styles.coletado]}>
          {usaFoto ? (
            <Image
              source={{ uri: foto! }}
              style={styles.foto}
              onLoad={pronto}
              onError={() => setFalhou(true)}
            />
          ) : (
            <View style={[styles.foto, styles.semFoto, { backgroundColor: cor }]}>
              <Ionicons name="school" size={20} color="#FFFFFF" />
            </View>
          )}
        </View>
        <View style={[styles.ponta, { borderTopColor: cor }]} />
        {selo && (
          <View style={[styles.selo, { backgroundColor: cor }]}>
            <Ionicons name={selo} size={11} color="#FFFFFF" />
          </View>
        )}
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  conteudo: {
    alignItems: 'center',
    // Espaço para o selo, que fica sobre a borda da foto.
    paddingTop: 4,
    paddingHorizontal: 4,
  },
  moldura: {
    borderRadius: 999,
    borderWidth: 3,
    backgroundColor: '#FFFFFF',
  },
  coletado: {
    opacity: 0.85,
  },
  foto: {
    width: TAMANHO_FOTO,
    height: TAMANHO_FOTO,
    borderRadius: TAMANHO_FOTO / 2,
  },
  semFoto: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ponta: {
    width: 0,
    height: 0,
    marginTop: -1,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  selo: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
