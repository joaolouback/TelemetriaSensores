/**
 * Tela de Perfil do Usuário — UVV Go
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTelemetria } from '../contexts/TelemetriaContext';
import { Avatar } from '../components/Avatar';
import { SeloConquista } from '../components/SeloConquista';
import { enviarFotoPerfil, removerFotoPerfil } from '../services/foto';
import { calcularNivel } from '../utils/nivel';
import { useColetas } from '../hooks/useColetas';
import { useDesafio } from '../contexts/DesafioContext';
import { buscarPlacarDesafios } from '../services/desafios';
import { buscarConquistas } from '../services/ranking';
import { ConquistaDoUsuario, PlacarDesafios } from '../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTema, useEstilos, PreferenciaTema } from '../contexts/TemaContext';
import type { Tema } from '../constants/temas';

const TEMAS: { id: PreferenciaTema; rotulo: string }[] = [
  { id: 'sistema', rotulo: 'Sistema' },
  { id: 'claro', rotulo: 'Claro' },
  { id: 'escuro', rotulo: 'Escuro' },
];

export function ProfileScreen() {
  const styles = useEstilos(criarEstilos);
  const { cores, barraStatus } = useTema();
  const insets = useSafeAreaInsets();
  const { usuario, sair, atualizarUsuario } = useAuth();
  const { preferencia, definirPreferencia } = useTema();
  const { consentimento, definirConsentimento } = useTelemetria();
  const { coletados } = useColetas();
  const pontuacao = usuario?.pontuacaoTotal ?? 0;
  const nivel = calcularNivel(pontuacao);
  const user = { nome: usuario?.nome ?? '' };
  const [enviandoFoto, setEnviandoFoto] = useState(false);

  const escolherFoto = async () => {
    // Carregado só aqui: é um módulo nativo, e um APK antigo (sem ele) não pode quebrar o app inteiro.
    let ImagePicker: typeof import('expo-image-picker');
    try {
      ImagePicker = await import('expo-image-picker');
    } catch {
      Alert.alert('Atualização necessária', 'Instale a versão mais recente do app para escolher a foto de perfil.');
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (resultado.canceled) return;

    const imagem = resultado.assets[0];
    setEnviandoFoto(true);
    try {
      atualizarUsuario(await enviarFotoPerfil(imagem.uri, imagem.mimeType));
    } catch (e) {
      Alert.alert('Não foi possível salvar a foto', e instanceof Error ? e.message : 'Tente novamente.');
    } finally {
      setEnviandoFoto(false);
    }
  };

  const removerFoto = async () => {
    setEnviandoFoto(true);
    try {
      atualizarUsuario(await removerFotoPerfil());
    } catch (e) {
      Alert.alert('Não foi possível remover a foto', e instanceof Error ? e.message : 'Tente novamente.');
    } finally {
      setEnviandoFoto(false);
    }
  };

  const abrirOpcoesFoto = () => {
    Alert.alert('Foto de perfil', undefined, [
      { text: 'Escolher da galeria', onPress: escolherFoto },
      ...(usuario?.fotoUrl ? [{ text: 'Remover foto', style: 'destructive' as const, onPress: removerFoto }] : []),
      { text: 'Cancelar', style: 'cancel' as const },
    ]);
  };

  // Placar dos desafios 1x1. Recarrega quando a pontuação muda (vitória dá bônus).
  const [placar, setPlacar] = useState<PlacarDesafios | null>(null);
  const { desafio } = useDesafio();
  useEffect(() => {
    buscarPlacarDesafios()
      .then(({ vitorias, derrotas, empates }) => setPlacar({ vitorias, derrotas, empates }))
      .catch(() => undefined);
  }, [usuario?.id, pontuacao, desafio?.status]);

  // Conquistas vindas da API; recarrega quando a pontuação muda (uma coleta pode desbloquear).
  const [conquistas, setConquistas] = useState<ConquistaDoUsuario[]>([]);
  useEffect(() => {
    if (!usuario?.id) return;
    buscarConquistas()
      .then(setConquistas)
      .catch(() => undefined);
  }, [usuario?.id, pontuacao]);
  const desbloqueadas = conquistas.filter((c) => c.desbloqueada).length;

  const mostrarConquista = (c: ConquistaDoUsuario) => {
    const situacao = c.desbloqueada
      ? `Desbloqueada${c.dataDesbloqueio ? ` em ${new Date(c.dataDesbloqueio).toLocaleDateString('pt-BR')}` : ''}.`
      : `Bloqueada: alcance ${c.pontosNecessarios} pontos para desbloquear.`;
    Alert.alert(c.titulo, [c.descricao, situacao].filter(Boolean).join('\n\n'));
  };

  const alternarTelemetria = (ligar: boolean) => {
    if (ligar) {
      definirConsentimento(true).catch(console.error);
      return;
    }
    Alert.alert(
      'Parar de compartilhar?',
      'A coleta será desligada e os registros que ainda não foram enviados serão apagados do aparelho.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Desligar', style: 'destructive', onPress: () => definirConsentimento(false).catch(console.error) },
      ]
    );
  };

  const confirmarSaida = () => {
    Alert.alert('Sair da conta', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => sair() },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={barraStatus} backgroundColor={cores.background} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Perfil */}
        <View style={[styles.header, { paddingTop: insets.top + 32 }]}>
          <TouchableOpacity
            onPress={abrirOpcoesFoto}
            disabled={enviandoFoto}
            activeOpacity={0.8}
            style={styles.avatarGrande}
            accessibilityRole="button"
            accessibilityLabel="Alterar foto de perfil"
          >
            <Avatar nome={user.nome} fotoUrl={usuario?.fotoUrl} tamanho={96} />
            <View style={styles.avatarBadge}>
              {enviandoFoto ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.nome}>{user.nome}</Text>
          <Text style={styles.titulo}>{nivel.titulo} · Nível {nivel.nivel}</Text>
          <Text style={styles.email}>{usuario?.email}</Text>
          {placar && placar.vitorias + placar.derrotas + placar.empates > 0 && (
            <Text style={styles.placarDesafios}>
              Desafios: {placar.vitorias} {placar.vitorias === 1 ? 'vitória' : 'vitórias'} ·{' '}
              {placar.derrotas} {placar.derrotas === 1 ? 'derrota' : 'derrotas'} · {placar.empates}{' '}
              {placar.empates === 1 ? 'empate' : 'empates'}
            </Text>
          )}
        </View>

        {/* ESTATÍSTICAS */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValor}>{pontuacao.toLocaleString('pt-BR')}</Text>
            <Text style={styles.statLabel}>Pontos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValor}>{coletados.size}</Text>
            <Text style={styles.statLabel}>Locais visitados</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValor}>{desbloqueadas}</Text>
            <Text style={styles.statLabel}>Conquistas</Text>
          </View>
        </View>

        {/* SEÇÃO CONQUISTAS */}
        <Text style={styles.secaoTitulo}>Conquistas</Text>

        <View style={styles.conquistasLista}>
          <View style={styles.conquistasGrade}>
            {conquistas.map((c, i) => (
              <SeloConquista key={c.id} conquista={c} posicao={i} onPress={() => mostrarConquista(c)} />
            ))}
          </View>
          {conquistas.length === 0 && (
            <Text style={[styles.conquistaDesc, { padding: 16 }]}>Carregando conquistas...</Text>
          )}
        </View>

        {/* OPÇÕES */}
        <View style={styles.opcoesContainer}>
          <View style={styles.opcaoItem}>
            <View style={styles.opcaoLinha}>
              <Ionicons name="contrast-outline" size={20} color={cores.discoverBlue} style={styles.opcaoIcone} />
              <View style={styles.opcaoTextos}>
                <Text style={styles.opcaoTexto}>Aparência</Text>
                <Text style={styles.opcaoDescricao}>Tema claro, escuro ou o mesmo do sistema</Text>
              </View>
            </View>
            <View style={styles.temaLinha} accessibilityRole="radiogroup">
              {TEMAS.map((t) => {
                const ativo = preferencia === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.temaOpcao, ativo && styles.temaOpcaoAtiva]}
                    onPress={() => definirPreferencia(t.id)}
                    activeOpacity={0.8}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: ativo }}
                  >
                    <Text style={[styles.temaTexto, ativo && styles.temaTextoAtivo]}>{t.rotulo}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          <View style={[styles.opcaoItem, styles.opcaoLinha]}>
            <Ionicons name="shield-checkmark-outline" size={20} color={cores.discoverBlue} style={styles.opcaoIcone} />
            <View style={styles.opcaoTextos}>
              <Text style={styles.opcaoTexto}>Compartilhar telemetria</Text>
              <Text style={styles.opcaoDescricao}>
                GPS, movimento e bateria para a pesquisa do TCC
              </Text>
            </View>
            <Switch
              value={consentimento === true}
              onValueChange={alternarTelemetria}
              trackColor={{ true: cores.discoverBlue, false: cores.cardBorder }}
              thumbColor="#FFFFFF"
              accessibilityLabel="Compartilhar telemetria para a pesquisa do TCC"
            />
          </View>
          <TouchableOpacity
            style={[styles.opcaoItem, styles.opcaoLinha, { borderBottomWidth: 0 }]}
            activeOpacity={0.7}
            onPress={confirmarSaida}
            accessibilityRole="button"
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" style={styles.opcaoIcone} />
            <Text style={[styles.opcaoTexto, { color: '#EF4444' }]}>Sair da conta</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const criarEstilos = (cores: Tema) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  avatarGrande: {
    marginBottom: 12,
  },
  avatarBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: cores.accent,
    borderWidth: 2,
    borderColor: cores.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  temaLinha: {
    flexDirection: 'row',
    marginTop: 10,
    backgroundColor: cores.background,
    borderRadius: 10,
    padding: 3,
  },
  temaOpcao: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  temaOpcaoAtiva: {
    backgroundColor: cores.card,
    borderWidth: 1,
    borderColor: cores.cardBorder,
  },
  temaTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: cores.textSecondary,
  },
  temaTextoAtivo: {
    color: cores.textPrimary,
    fontWeight: '800',
  },
  nome: {
    fontSize: 24,
    fontWeight: '800',
    color: cores.textPrimary,
  },
  titulo: {
    fontSize: 14,
    fontWeight: '700',
    color: cores.textSecondary,
    marginTop: 4,
  },
  email: {
    fontSize: 13,
    color: cores.textSecondary,
    marginTop: 2,
  },
  placarDesafios: {
    fontSize: 13,
    fontWeight: '700',
    color: cores.textSecondary,
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: cores.card,
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: cores.cardBorder,
    marginBottom: 24,
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: cores.cardBorder,
  },
  statValor: {
    fontSize: 18,
    fontWeight: '800',
    color: cores.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: cores.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  secaoTitulo: {
    fontSize: 18,
    fontWeight: '800',
    color: cores.textPrimary,
    marginBottom: 14,
  },
  conquistasLista: {
    backgroundColor: cores.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: cores.cardBorder,
    overflow: 'hidden',
    marginBottom: 24,
  },
  conquistasGrade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  conquistaDesc: {
    fontSize: 12,
    color: cores.textSecondary,
    marginTop: 2,
  },

  opcoesContainer: {
    backgroundColor: cores.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: cores.cardBorder,
    overflow: 'hidden',
  },
  opcaoItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: cores.cardBorder,
  },
  opcaoTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: cores.textPrimary,
  },
  opcaoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  opcaoIcone: {
    marginRight: 12,
  },
  opcaoTextos: {
    flex: 1,
    marginRight: 12,
  },
  opcaoDescricao: {
    fontSize: 12,
    color: cores.textSecondary,
    marginTop: 2,
  },
});
