/** Painel que sobe da parte de baixo da tela (detalhes de um local, lista de níveis...). */
import React from 'react';
import { Modal, View, Text, ScrollView, Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTema, useEstilos } from '../contexts/TemaContext';
import type { Tema } from '../constants/temas';

interface Props {
  visivel: boolean;
  titulo: string;
  onFechar: () => void;
  children: React.ReactNode;
}

export function FolhaInferior({ visivel, titulo, onFechar, children }: Props) {
  const styles = useEstilos(criarEstilos);
  const { cores } = useTema();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visivel} transparent animationType="slide" onRequestClose={onFechar} statusBarTranslucent>
      <Pressable
        style={styles.fundo}
        onPress={onFechar}
        accessibilityLabel="Fechar"
        accessibilityRole="button"
      />
      <View style={[styles.folha, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.alca} />
        <View style={styles.cabecalho}>
          <Text style={styles.titulo} numberOfLines={2}>
            {titulo}
          </Text>
          <TouchableOpacity
            onPress={onFechar}
            hitSlop={10}
            style={styles.fechar}
            accessibilityRole="button"
            accessibilityLabel="Fechar"
          >
            <Ionicons name="close" size={20} color={cores.textSecondary} />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.conteudo}>
          {children}
        </ScrollView>
      </View>
    </Modal>
  );
}

const criarEstilos = (cores: Tema) =>
  StyleSheet.create({
    fundo: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    folha: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      maxHeight: '85%',
      backgroundColor: cores.card,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      paddingHorizontal: 20,
      paddingTop: 10,
    },
    alca: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: cores.cardBorder,
      marginBottom: 12,
    },
    cabecalho: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    titulo: {
      flex: 1,
      fontSize: 20,
      fontWeight: '800',
      color: cores.textPrimary,
      marginRight: 12,
    },
    fechar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: cores.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    conteudo: {
      paddingBottom: 8,
    },
  });
