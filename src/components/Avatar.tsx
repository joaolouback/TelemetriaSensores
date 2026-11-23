/**
 * Avatar do jogador: a foto de perfil, ou as iniciais quando não há foto (ou ela falha ao carregar).
 * Com uma moldura da loja, ganha um anel colorido em volta (e um halo, se ela tiver brilho).
 */
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { obterIniciais } from '../utils';
import { urlDoServidor } from '../utils/url';
import { useTema } from '../contexts/TemaContext';
import type { MolduraVisual } from '../types';

interface Props {
  nome: string;
  fotoUrl?: string | null;
  tamanho: number;
  /** Cor de fundo das iniciais; por padrão, a cor de destaque do tema. */
  cor?: string;
  /** Moldura comprada na loja. */
  moldura?: MolduraVisual | null;
  /** Chamado quando o avatar está pronto para ser desenhado (foto carregada, ou as iniciais). */
  onPronto?: () => void;
}

export function Avatar({ nome, fotoUrl, tamanho, cor, moldura, onPronto }: Props) {
  const { cores } = useTema();
  const [falhou, setFalhou] = useState(false);

  // Uma foto nova deve ser tentada de novo, mesmo que a anterior tenha falhado.
  useEffect(() => setFalhou(false), [fotoUrl]);

  // Sem foto (ou com falha), as iniciais já estão prontas.
  const usaFoto = Boolean(fotoUrl) && !falhou;
  useEffect(() => {
    if (!usaFoto) onPronto?.();
  }, [usaFoto, onPronto]);

  const forma = { width: tamanho, height: tamanho, borderRadius: tamanho / 2 };

  const miolo =
    fotoUrl && !falhou ? (
      <Image
        source={{ uri: urlDoServidor(fotoUrl) }}
        style={[forma, { backgroundColor: cores.cardBorder }]}
        onLoad={onPronto}
        onError={() => setFalhou(true)}
        accessibilityLabel={`Foto de ${nome}`}
      />
    ) : (
      <View style={[styles.iniciais, forma, { backgroundColor: cor ?? cores.accent }]}>
        <Text style={[styles.texto, { fontSize: tamanho * 0.36 }]}>{obterIniciais(nome)}</Text>
      </View>
    );

  const coresMoldura = moldura?.cores;
  if (!coresMoldura?.length) return miolo;

  // Uma cor = anel sólido; duas = alternadas; quatro = um quarto de anel cada.
  const corDoLado = (i: number) => coresMoldura[i % coresMoldura.length];
  const espessura = Math.max(2, Math.round(tamanho * 0.07));
  const folga = Math.max(1, Math.round(tamanho * 0.03));
  const externo = tamanho + 2 * (espessura + folga);

  const anel = (
    <View
      style={[
        styles.centro,
        {
          width: externo,
          height: externo,
          borderRadius: externo / 2,
          borderWidth: espessura,
          borderTopColor: corDoLado(0),
          borderRightColor: corDoLado(1),
          borderBottomColor: corDoLado(2),
          borderLeftColor: corDoLado(3),
        },
      ]}
    >
      {miolo}
    </View>
  );

  if (!moldura?.brilho) return anel;

  const halo = externo + 2 * espessura;
  return (
    <View
      style={[
        styles.centro,
        { width: halo, height: halo, borderRadius: halo / 2, backgroundColor: `${corDoLado(0)}40` },
      ]}
    >
      {anel}
    </View>
  );
}

const styles = StyleSheet.create({
  iniciais: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centro: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
