/**
 * Detalhes de um ponto do campus, abertos a partir da seção "Descubra" do Início.
 * Mostra a foto, a descrição e a curiosidade (liberada só depois da coleta), e leva o
 * jogador até o ponto: no mapa do app ou na rota do Google Maps.
 */
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PontoDeInteresse } from '../types';
import { urlDoServidor } from '../utils/url';
import { useTema, useEstilos } from '../contexts/TemaContext';
import type { Tema } from '../constants/temas';
import { FolhaInferior } from './FolhaInferior';

interface Props {
  ponto: PontoDeInteresse | null;
  coletado: boolean;
  onFechar: () => void;
  /** Fecha o detalhe e centraliza o mapa do app no ponto. */
  onVerNoMapa: (pontoId: number) => void;
}

export function DetalheLocal({ ponto, coletado, onFechar, onVerNoMapa }: Props) {
  const styles = useEstilos(criarEstilos);
  const { cores } = useTema();

  const comoChegar = () => {
    if (!ponto) return;
    const destino = `${ponto.latitude},${ponto.longitude}`;
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${destino}&travelmode=walking`).catch(() =>
      Alert.alert('Não foi possível abrir o Google Maps', 'Instale um app de mapas para traçar a rota.')
    );
  };

  return (
    <FolhaInferior visivel={ponto !== null} titulo={ponto?.nome ?? ''} onFechar={onFechar}>
      {ponto && (
        <>
          {ponto.imagemUrl && (
            <Image
              source={{ uri: urlDoServidor(ponto.imagemUrl) }}
              style={styles.foto}
              accessibilityLabel={`Foto de ${ponto.nome}`}
            />
          )}

          <View style={styles.selos}>
            <View style={[styles.selo, coletado && styles.seloColetado]}>
              <Ionicons
                name={coletado ? 'checkmark-circle' : 'diamond-outline'}
                size={14}
                color={coletado ? cores.successText : cores.textSecondary}
              />
              <Text style={[styles.seloTexto, coletado && { color: cores.successText }]}>
                {coletado ? 'Já coletado' : 'Cristal disponível'}
              </Text>
            </View>
            <View style={styles.selo}>
              <Ionicons name="star-outline" size={14} color={cores.textSecondary} />
              <Text style={styles.seloTexto}>{ponto.pontosRecompensa} pontos</Text>
            </View>
          </View>

          <Text style={styles.descricao}>
            {ponto.descricao ?? 'Um dos pontos de coleta do campus da UVV.'}
          </Text>

          {ponto.curiosidade &&
            (coletado ? (
              <View style={styles.bloco}>
                <Text style={styles.blocoTitulo}>Curiosidade</Text>
                <Text style={styles.blocoTexto}>{ponto.curiosidade}</Text>
              </View>
            ) : (
              <View style={styles.bloco}>
                <View style={styles.blocoLinha}>
                  <Ionicons name="lock-closed-outline" size={16} color={cores.textMuted} />
                  <Text style={styles.blocoTitulo}>Curiosidade bloqueada</Text>
                </View>
                <Text style={styles.blocoTexto}>Colete o cristal deste local para desbloquear.</Text>
              </View>
            ))}

          <View style={styles.bloco}>
            <Text style={styles.blocoTitulo}>Como coletar</Text>
            <Text style={styles.blocoTexto}>
              Chegue a até {ponto.raioGeofence} m do local, abra a câmera de realidade aumentada no mapa e toque no
              cristal.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.botao}
            onPress={() => onVerNoMapa(ponto.id)}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <Ionicons name="map-outline" size={18} color="#FFFFFF" />
            <Text style={styles.botaoTexto}>Ver no mapa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.botao, styles.botaoSecundario]}
            onPress={comoChegar}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <Ionicons name="navigate-outline" size={18} color={cores.accent} />
            <Text style={[styles.botaoTexto, { color: cores.accent }]}>Como chegar</Text>
          </TouchableOpacity>
        </>
      )}
    </FolhaInferior>
  );
}

const criarEstilos = (cores: Tema) =>
  StyleSheet.create({
    foto: {
      width: '100%',
      height: 170,
      borderRadius: 14,
      backgroundColor: cores.cardBorder,
      marginBottom: 14,
    },
    selos: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 14,
    },
    selo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 999,
      backgroundColor: cores.background,
    },
    seloColetado: {
      backgroundColor: cores.successBg,
    },
    seloTexto: {
      fontSize: 12,
      fontWeight: '700',
      color: cores.textSecondary,
    },
    descricao: {
      fontSize: 15,
      lineHeight: 22,
      color: cores.textPrimary,
      marginBottom: 14,
    },
    bloco: {
      backgroundColor: cores.background,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
    },
    blocoLinha: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    blocoTitulo: {
      fontSize: 13,
      fontWeight: '800',
      color: cores.textPrimary,
      marginBottom: 4,
    },
    blocoTexto: {
      fontSize: 13,
      lineHeight: 19,
      color: cores.textSecondary,
    },
    botao: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: cores.accent,
      borderRadius: 12,
      paddingVertical: 13,
      marginTop: 4,
    },
    botaoSecundario: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: cores.accent,
      marginTop: 8,
    },
    botaoTexto: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 15,
    },
  });
