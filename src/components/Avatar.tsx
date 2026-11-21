/** Avatar do jogador: a foto de perfil, ou as iniciais quando não há foto (ou ela falha ao carregar). */
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { obterIniciais } from '../utils';
import { urlDoServidor } from '../utils/url';
import { useTema } from '../contexts/TemaContext';

interface Props {
  nome: string;
  fotoUrl?: string | null;
  tamanho: number;
  /** Cor de fundo das iniciais; por padrão, a cor de destaque do tema. */
  cor?: string;
}

export function Avatar({ nome, fotoUrl, tamanho, cor }: Props) {
  const { cores } = useTema();
  const [falhou, setFalhou] = useState(false);

  // Uma foto nova deve ser tentada de novo, mesmo que a anterior tenha falhado.
  useEffect(() => setFalhou(false), [fotoUrl]);

  const forma = { width: tamanho, height: tamanho, borderRadius: tamanho / 2 };

  if (fotoUrl && !falhou) {
    return (
      <Image
        source={{ uri: urlDoServidor(fotoUrl) }}
        style={[forma, { backgroundColor: cores.cardBorder }]}
        onError={() => setFalhou(true)}
        accessibilityLabel={`Foto de ${nome}`}
      />
    );
  }

  return (
    <View style={[styles.iniciais, forma, { backgroundColor: cor ?? cores.accent }]}>
      <Text style={[styles.texto, { fontSize: tamanho * 0.36 }]}>{obterIniciais(nome)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  iniciais: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
