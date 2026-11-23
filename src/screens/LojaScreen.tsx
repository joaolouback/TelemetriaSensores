/**
 * Loja de itens — molduras da foto, temas do app, títulos e cor do rastro no mapa.
 *
 * Os itens são comprados com os pontos do jogo. O saldo é a pontuação total menos o que já
 * foi gasto: comprar não muda a posição no ranking.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useLoja } from '../contexts/LojaContext';
import { useTema, useEstilos } from '../contexts/TemaContext';
import { Avatar } from '../components/Avatar';
import { TEMAS_LOJA, type Tema } from '../constants/temas';
import { vibrarSucesso, vibrarSelecao } from '../utils/vibracao';
import { CategoriaItem, ItemLoja } from '../types';

const CATEGORIAS: { id: CategoriaItem; rotulo: string; icone: keyof typeof Ionicons.glyphMap; dica: string }[] = [
  { id: 'MOLDURA', rotulo: 'Molduras', icone: 'ellipse-outline', dica: 'Um anel em volta da sua foto, visto também no ranking.' },
  { id: 'TEMA', rotulo: 'Temas', icone: 'color-palette-outline', dica: 'As cores de todo o aplicativo.' },
  { id: 'TITULO', rotulo: 'Títulos', icone: 'ribbon-outline', dica: 'Aparece abaixo do seu nome no perfil e no ranking.' },
  { id: 'RASTRO', rotulo: 'Rastros', icone: 'trail-sign-outline', dica: 'A cor do trajeto que você percorre no mapa.' },
];

export function LojaScreen() {
  const styles = useEstilos(criarEstilos);
  const { cores, barraStatus } = useTema();
  const insets = useSafeAreaInsets();
  const { loja, erro, recarregar, comprar, equipar } = useLoja();
  const [categoria, setCategoria] = useState<CategoriaItem>('MOLDURA');
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [atualizando, setAtualizando] = useState(false);

  const aoPuxar = async () => {
    setAtualizando(true);
    await recarregar();
    setAtualizando(false);
  };

  const executar = async (codigo: string, acao: () => Promise<void>, titulo: string) => {
    setOcupado(codigo);
    try {
      await acao();
    } catch (e) {
      Alert.alert(titulo, e instanceof Error ? e.message : 'Tente novamente.');
    } finally {
      setOcupado(null);
    }
  };

  const aoTocarItem = (item: ItemLoja) => {
    if (!loja || ocupado) return;

    if (item.equipado) {
      Alert.alert(item.nome, 'Deixar de usar este item e voltar ao padrão?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Voltar ao padrão', onPress: () => executar(item.codigo, () => equipar(item.categoria, null), 'Não foi possível trocar') },
      ]);
      return;
    }

    if (item.possui) {
      vibrarSelecao();
      executar(item.codigo, () => equipar(item.categoria, item.codigo), 'Não foi possível equipar');
      return;
    }

    if (loja.saldo < item.preco) {
      Alert.alert('Saldo insuficiente', `Faltam ${item.preco - loja.saldo} pontos. Colete mais anéis pelo campus ou vença um desafio 1x1.`);
      return;
    }

    Alert.alert(
      `Comprar ${item.nome}?`,
      `Custa ${item.preco} pontos. Seu saldo vai de ${loja.saldo} para ${loja.saldo - item.preco}.\n\nSua posição no ranking não muda.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Comprar',
          onPress: () =>
            executar(
              item.codigo,
              async () => {
                await comprar(item.codigo);
                vibrarSucesso();
              },
              'Não foi possível comprar'
            ),
        },
      ]
    );
  };

  const atual = CATEGORIAS.find((c) => c.id === categoria)!;
  const itens = loja?.itens.filter((i) => i.categoria === categoria) ?? [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle={barraStatus} backgroundColor={cores.background} />

      <View style={[styles.header, { paddingTop: insets.top + 32 }]}>
        <Text style={styles.headerTitulo}>Loja</Text>
        <Text style={styles.headerSubtitulo}>Personalize seu perfil com os pontos do jogo</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={aoPuxar} />}
      >
        <View style={styles.saldo} accessibilityLabel={`Saldo: ${loja?.saldo ?? 0} pontos`}>
          <View style={styles.saldoIcone}>
            <Ionicons name="wallet" size={22} color={cores.xpGold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.saldoRotulo}>Saldo para gastar</Text>
            <Text style={styles.saldoValor}>
              {(loja?.saldo ?? 0).toLocaleString('pt-BR')}
              <Text style={styles.saldoSufixo}> pts</Text>
            </Text>
          </View>
          {loja && loja.pontosGastos > 0 && (
            <Text style={styles.saldoGasto}>{loja.pontosGastos} gastos</Text>
          )}
        </View>
        <Text style={styles.aviso}>Comprar não tira pontos do ranking.</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.abas} accessibilityRole="tablist">
          {CATEGORIAS.map((c) => {
            const ativa = c.id === categoria;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.aba, ativa && styles.abaAtiva]}
                onPress={() => setCategoria(c.id)}
                activeOpacity={0.8}
                accessibilityRole="tab"
                accessibilityState={{ selected: ativa }}
              >
                <Ionicons name={c.icone} size={16} color={ativa ? cores.sobreAcento : cores.textSecondary} />
                <Text style={[styles.abaTexto, ativa && styles.abaTextoAtiva]}>{c.rotulo}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <Text style={styles.dica}>{atual.dica}</Text>

        {!loja && !erro && <ActivityIndicator style={styles.estado} color={cores.discoverBlue} />}
        {!loja && erro && (
          <View style={styles.estado}>
            <Text style={styles.estadoTexto}>{erro}</Text>
            <TouchableOpacity style={styles.botaoTentar} onPress={aoPuxar} accessibilityRole="button">
              <Text style={styles.botaoTentarTexto}>Tentar de novo</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.grade}>
          {itens.map((item) => (
            <CartaoItem
              key={item.codigo}
              item={item}
              saldo={loja?.saldo ?? 0}
              ocupado={ocupado === item.codigo}
              onPress={() => aoTocarItem(item)}
            />
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

function CartaoItem({
  item,
  saldo,
  ocupado,
  onPress,
}: {
  item: ItemLoja;
  saldo: number;
  ocupado: boolean;
  onPress: () => void;
}) {
  const styles = useEstilos(criarEstilos);
  const { cores } = useTema();
  const semSaldo = !item.possui && saldo < item.preco;

  const rotulo = item.equipado ? 'Em uso' : item.possui ? 'Usar' : `${item.preco} pts`;
  const situacao = item.equipado
    ? 'em uso, toque para voltar ao padrão'
    : item.possui
      ? 'comprado, toque para usar'
      : `custa ${item.preco} pontos${semSaldo ? ', saldo insuficiente' : ''}`;

  return (
    <TouchableOpacity
      style={[styles.cartao, item.equipado && styles.cartaoEquipado]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={ocupado}
      accessibilityRole="button"
      accessibilityLabel={`${item.nome}, ${situacao}`}
    >
      <View style={styles.previa}>
        <Previa item={item} />
      </View>
      <Text style={styles.cartaoNome} numberOfLines={1}>
        {item.nome}
      </Text>
      <Text style={styles.cartaoDescricao} numberOfLines={2}>
        {item.descricao}
      </Text>
      <View
        style={[
          styles.botao,
          item.possui ? styles.botaoContorno : styles.botaoCheio,
          item.equipado && styles.botaoEquipado,
          semSaldo && styles.botaoBloqueado,
        ]}
      >
        {ocupado ? (
          <ActivityIndicator size="small" color={item.possui ? cores.accent : cores.sobreAcento} />
        ) : (
          <>
            {item.equipado && <Ionicons name="checkmark-circle" size={14} color={cores.success} />}
            {!item.possui && <Ionicons name={semSaldo ? 'lock-closed' : 'cart'} size={13} color={semSaldo ? cores.textMuted : cores.sobreAcento} />}
            <Text
              style={[
                styles.botaoTexto,
                item.possui ? { color: item.equipado ? cores.success : cores.accent } : { color: cores.sobreAcento },
                semSaldo && { color: cores.textMuted },
              ]}
            >
              {rotulo}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

/** Amostra de como o item fica. */
function Previa({ item }: { item: ItemLoja }) {
  const styles = useEstilos(criarEstilos);
  const { usuario } = useAuth();
  const { cores } = useTema();

  switch (item.categoria) {
    case 'MOLDURA':
      return (
        <Avatar
          nome={usuario?.nome ?? ''}
          fotoUrl={usuario?.fotoUrl}
          tamanho={52}
          moldura={{ codigo: item.codigo, ...item.visual }}
        />
      );

    case 'TEMA': {
      const tema = TEMAS_LOJA[item.codigo]?.cores;
      if (!tema) return <Ionicons name="color-palette" size={40} color={cores.textMuted} />;
      // Miniatura de uma tela: fundo, um cartão e a barra de destaque.
      return (
        <View style={[styles.miniTela, { backgroundColor: tema.background, borderColor: tema.cardBorder }]}>
          <View style={[styles.miniBarra, { backgroundColor: tema.accent }]} />
          <View style={[styles.miniCartao, { backgroundColor: tema.card, borderColor: tema.cardBorder }]}>
            <View style={[styles.miniLinha, { backgroundColor: tema.discoverBlue }]} />
            <View style={[styles.miniLinha, { backgroundColor: tema.textMuted, width: '60%' }]} />
          </View>
          <View style={[styles.miniAbas, { backgroundColor: tema.tabBar }]}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[styles.miniPonto, { backgroundColor: i === 0 ? tema.accent : tema.textMuted }]} />
            ))}
          </View>
        </View>
      );
    }

    case 'TITULO':
      return (
        <View style={styles.selo}>
          <Ionicons name="ribbon" size={13} color={cores.xpGold} />
          <Text style={styles.seloTexto} numberOfLines={2}>
            {item.visual.texto}
          </Text>
        </View>
      );

    case 'RASTRO': {
      const cor = item.visual.cores?.[0] ?? cores.discoverBlue;
      // Um trajeto em zigue-zague, como a linha que aparece no mapa.
      return (
        <View style={styles.rastro}>
          <View style={[styles.rastroTrecho, { backgroundColor: cor, left: 4, top: 26, transform: [{ rotate: '-25deg' }] }]} />
          <View style={[styles.rastroTrecho, { backgroundColor: cor, left: 34, top: 26, transform: [{ rotate: '25deg' }] }]} />
          <View style={[styles.rastroTrecho, { backgroundColor: cor, left: 64, top: 26, transform: [{ rotate: '-25deg' }] }]} />
          <Ionicons name="navigate" size={18} color={cor} style={styles.rastroSeta} />
        </View>
      );
    }
  }
}

const criarEstilos = (cores: Tema) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: cores.background,
    },
    header: {
      paddingBottom: 16,
      paddingHorizontal: 20,
    },
    headerTitulo: {
      fontSize: 26,
      fontWeight: '800',
      color: cores.textPrimary,
    },
    headerSubtitulo: {
      fontSize: 14,
      color: cores.textSecondary,
      marginTop: 4,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 24,
    },

    saldo: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: cores.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: cores.cardBorder,
      padding: 14,
    },
    saldoIcone: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: cores.destaqueSuave,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    saldoRotulo: {
      fontSize: 12,
      fontWeight: '600',
      color: cores.textSecondary,
    },
    saldoValor: {
      fontSize: 24,
      fontWeight: '800',
      color: cores.textPrimary,
    },
    saldoSufixo: {
      fontSize: 14,
      fontWeight: '700',
      color: cores.textSecondary,
    },
    saldoGasto: {
      fontSize: 12,
      color: cores.textMuted,
      fontWeight: '600',
    },
    aviso: {
      fontSize: 12,
      color: cores.textMuted,
      marginTop: 6,
      marginBottom: 16,
      marginLeft: 4,
    },

    abas: {
      gap: 8,
      paddingBottom: 4,
    },
    aba: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 20,
      backgroundColor: cores.card,
      borderWidth: 1,
      borderColor: cores.cardBorder,
    },
    abaAtiva: {
      backgroundColor: cores.accent,
      borderColor: cores.accent,
    },
    abaTexto: {
      fontSize: 13,
      fontWeight: '700',
      color: cores.textSecondary,
    },
    abaTextoAtiva: {
      color: cores.sobreAcento,
    },
    dica: {
      fontSize: 12,
      color: cores.textSecondary,
      marginTop: 10,
      marginBottom: 12,
    },

    estado: {
      alignItems: 'center',
      paddingVertical: 32,
    },
    estadoTexto: {
      fontSize: 14,
      color: cores.textSecondary,
      textAlign: 'center',
    },
    botaoTentar: {
      marginTop: 12,
      backgroundColor: cores.accent,
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 10,
    },
    botaoTentarTexto: {
      color: cores.sobreAcento,
      fontWeight: '700',
    },

    grade: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: 12,
    },
    cartao: {
      width: '48.5%',
      backgroundColor: cores.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: cores.cardBorder,
      padding: 12,
    },
    cartaoEquipado: {
      borderColor: cores.success,
      borderWidth: 2,
      padding: 11,
    },
    previa: {
      height: 84,
      borderRadius: 10,
      backgroundColor: cores.background,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
      overflow: 'hidden',
    },
    cartaoNome: {
      fontSize: 14,
      fontWeight: '800',
      color: cores.textPrimary,
    },
    cartaoDescricao: {
      fontSize: 11,
      color: cores.textSecondary,
      marginTop: 2,
      minHeight: 28,
    },
    botao: {
      marginTop: 10,
      height: 32,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
    },
    botaoCheio: {
      backgroundColor: cores.accent,
    },
    botaoContorno: {
      borderWidth: 1,
      borderColor: cores.accent,
    },
    botaoEquipado: {
      borderColor: cores.success,
      backgroundColor: cores.successBg,
    },
    botaoBloqueado: {
      backgroundColor: cores.cardBorder,
    },
    botaoTexto: {
      fontSize: 13,
      fontWeight: '800',
    },

    miniTela: {
      width: 54,
      height: 74,
      borderRadius: 8,
      borderWidth: 1,
      overflow: 'hidden',
    },
    miniBarra: {
      height: 14,
    },
    miniCartao: {
      margin: 5,
      padding: 4,
      borderRadius: 4,
      borderWidth: 1,
      gap: 3,
    },
    miniLinha: {
      height: 4,
      borderRadius: 2,
    },
    miniAbas: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 12,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    miniPonto: {
      width: 5,
      height: 5,
      borderRadius: 3,
    },

    selo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 14,
      backgroundColor: cores.card,
      borderWidth: 1,
      borderColor: cores.xpGold,
      maxWidth: '92%',
    },
    seloTexto: {
      fontSize: 12,
      fontWeight: '800',
      color: cores.textPrimary,
      flexShrink: 1,
    },

    rastro: {
      width: 110,
      height: 60,
    },
    rastroTrecho: {
      position: 'absolute',
      width: 34,
      height: 5,
      borderRadius: 3,
    },
    rastroSeta: {
      position: 'absolute',
      right: 0,
      top: 18,
      transform: [{ rotate: '45deg' }],
    },
  });
