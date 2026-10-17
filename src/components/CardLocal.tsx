/**
 * Card do local, exibido depois de coletar o cristal em AR.
 *
 * Transforma a coleta num pequeno tour pelo campus: mostra a foto, a descrição
 * e a curiosidade do ponto (cadastradas no seed da API), além dos pontos
 * ganhos, das conquistas e do progresso no desafio 1x1.
 */
import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { HOME_COLORS } from '../constants';
import { PontoDeInteresse, ResultadoCheckin } from '../types';
import { urlDoServidor } from '../utils/url';

interface Props {
  ponto: PontoDeInteresse;
  resultado: ResultadoCheckin;
  onFechar: () => void;
}

export function CardLocal({ ponto, resultado, onFechar }: Props) {
  const { desafio } = resultado;

  return (
    <View style={styles.cartao}>
      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
        {ponto.imagemUrl ? (
          <Image source={{ uri: urlDoServidor(ponto.imagemUrl) }} style={styles.foto} resizeMode="cover" />
        ) : null}

        <Text style={styles.rotulo}>Você descobriu</Text>
        <Text style={styles.titulo}>{ponto.nome}</Text>

        <View style={styles.selos}>
          {resultado.pontosGanhos > 0 ? (
            <Text style={[styles.selo, styles.seloPontos]}>+{resultado.pontosGanhos} pontos</Text>
          ) : (
            <Text style={[styles.selo, styles.seloNeutro]}>Já coletado antes</Text>
          )}
          <Text style={[styles.selo, styles.seloNeutro]}>Total: {resultado.pontuacaoTotal}</Text>
        </View>

        {desafio && (
          <View style={[styles.desafio, desafio.resultado === 'vitoria' && styles.desafioVitoria]}>
            <Text style={styles.desafioTexto}>
              {desafio.resultado === 'vitoria'
                ? `🏆 Você venceu o desafio! +${desafio.bonus} pontos de bônus`
                : `⚔️ Desafio: ${desafio.coletados} de ${desafio.total} pontos coletados`}
            </Text>
          </View>
        )}

        {resultado.novasConquistas.map((c) => (
          <Text key={c.id} style={styles.conquista}>
            🏅 Conquista desbloqueada: {c.titulo}
          </Text>
        ))}

        {ponto.descricao ? <Text style={styles.descricao}>{ponto.descricao}</Text> : null}

        {ponto.curiosidade ? (
          <View style={styles.curiosidade}>
            <Text style={styles.curiosidadeRotulo}>💡 Você sabia?</Text>
            <Text style={styles.curiosidadeTexto}>{ponto.curiosidade}</Text>
          </View>
        ) : null}
      </ScrollView>

      <TouchableOpacity style={styles.botao} onPress={onFechar} activeOpacity={0.85}>
        <Text style={styles.botaoTexto}>Voltar ao mapa</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 18,
    padding: 16,
    maxHeight: 520,
    borderWidth: 2,
    borderColor: HOME_COLORS.success,
    elevation: 10,
  },
  conteudo: {
    paddingBottom: 4,
  },
  foto: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: HOME_COLORS.cardBorder,
  },
  rotulo: {
    color: HOME_COLORS.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  titulo: {
    color: HOME_COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },
  selos: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  selo: {
    fontSize: 13,
    fontWeight: '800',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  seloPontos: {
    color: HOME_COLORS.successText,
    backgroundColor: HOME_COLORS.successBg,
  },
  seloNeutro: {
    color: HOME_COLORS.textSecondary,
    backgroundColor: HOME_COLORS.background,
  },
  desafio: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: HOME_COLORS.missionIconBg,
  },
  desafioVitoria: {
    backgroundColor: '#FEF3C7',
  },
  desafioTexto: {
    color: HOME_COLORS.accent,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  conquista: {
    color: HOME_COLORS.accent,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 10,
  },
  descricao: {
    color: HOME_COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  curiosidade: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: HOME_COLORS.background,
    borderLeftWidth: 4,
    borderLeftColor: HOME_COLORS.xpGold,
  },
  curiosidadeRotulo: {
    color: HOME_COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  curiosidadeTexto: {
    color: HOME_COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  botao: {
    backgroundColor: HOME_COLORS.discoverBlue,
    borderRadius: 12,
    paddingVertical: 13,
    marginTop: 12,
  },
  botaoTexto: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
    textAlign: 'center',
  },
});
