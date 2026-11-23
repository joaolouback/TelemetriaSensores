/**
 * O jogador no mapa: a foto de perfil (com a moldura da loja) e uma ponta embaixo,
 * no lugar do ponto azul padrão do Google Maps.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { Avatar } from './Avatar';
import type { MolduraVisual } from '../types';

interface Props {
  latitude: number;
  longitude: number;
  nome: string;
  fotoUrl?: string | null;
  moldura?: MolduraVisual | null;
  /** Cor da borda e da ponta (sem moldura). */
  cor: string;
  titulo: string;
}

const TAMANHO_FOTO = 40;

export function MarcadorJogador({ latitude, longitude, nome, fotoUrl, moldura, cor, titulo }: Props) {
  // No Android, o marcador é uma "foto" da view: redesenhar a cada leitura do GPS pesa, e
  // congelar cedo demais deixa a imagem em branco. Redesenha até a foto carregar e então para.
  const [redesenhar, setRedesenhar] = useState(true);
  useEffect(() => setRedesenhar(true), [fotoUrl, moldura?.codigo, cor]);
  const aoFicarPronto = useCallback(() => {
    // Um respiro para o mapa capturar a imagem já desenhada.
    setTimeout(() => setRedesenhar(false), 300);
  }, []);

  const comMoldura = Boolean(moldura?.cores?.length);
  const corPonta = comMoldura ? moldura!.cores![0] : cor;

  return (
    <Marker
      coordinate={{ latitude, longitude }}
      anchor={{ x: 0.5, y: 1 }}
      tracksViewChanges={redesenhar}
      zIndex={1000}
      title={titulo}
    >
      <View style={styles.conteudo}>
        <View style={[styles.foto, !comMoldura && { borderColor: cor }]}>
          <Avatar nome={nome} fotoUrl={fotoUrl} tamanho={TAMANHO_FOTO} moldura={moldura} onPronto={aoFicarPronto} />
        </View>
        <View style={[styles.ponta, { borderTopColor: corPonta }]} />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  conteudo: {
    alignItems: 'center',
  },
  foto: {
    borderRadius: 999,
    borderWidth: 3,
    borderColor: 'transparent',
    backgroundColor: '#FFFFFF',
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
});
