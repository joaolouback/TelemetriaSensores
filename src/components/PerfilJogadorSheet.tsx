/** Perfil de outro jogador, aberto ao tocar nele no ranking. */
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { buscarPerfilJogador } from '../services/ranking';
import { PerfilJogador } from '../types';
import { calcularNivel } from '../utils/nivel';
import { useTema, useEstilos } from '../contexts/TemaContext';
import type { Tema } from '../constants/temas';
import { Avatar } from './Avatar';
import { FolhaInferior } from './FolhaInferior';
import { SeloConquista } from './SeloConquista';

interface Props {
  /** Id do jogador a mostrar; null mantém o painel fechado. */
  jogadorId: number | null;
  onFechar: () => void;
}

export function PerfilJogadorSheet({ jogadorId, onFechar }: Props) {
  const styles = useEstilos(criarEstilos);
  const { cores } = useTema();
  const [perfil, setPerfil] = useState<PerfilJogador | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    setPerfil(null);
    setErro(null);
    if (jogadorId === null) return;

    let cancelado = false;
    buscarPerfilJogador(jogadorId)
      .then((dados) => !cancelado && setPerfil(dados))
      .catch((e) => !cancelado && setErro(e instanceof Error ? e.message : 'Não foi possível carregar o perfil.'));
    return () => {
      cancelado = true;
    };
  }, [jogadorId]);

  const nivel = perfil ? calcularNivel(perfil.pontuacaoTotal) : null;
  const desbloqueadas = perfil?.conquistas.filter((c) => c.desbloqueada).length ?? 0;
  const { vitorias = 0, derrotas = 0, empates = 0 } = perfil?.desafios ?? {};

  const mostrarConquista = (titulo: string, descricao: string | null, desbloqueada: boolean) =>
    Alert.alert(titulo, [descricao, desbloqueada ? 'Desbloqueada.' : 'Ainda bloqueada.'].filter(Boolean).join('\n\n'));

  return (
    <FolhaInferior visivel={jogadorId !== null} titulo="Perfil do jogador" onFechar={onFechar}>
      {!perfil && !erro && <ActivityIndicator style={styles.estado} color={cores.accent} />}
      {erro && <Text style={[styles.estado, styles.erro]}>{erro}</Text>}

      {perfil && nivel && (
        <>
          <View style={styles.topo}>
            <Avatar nome={perfil.nome} fotoUrl={perfil.fotoUrl} tamanho={84} />
            <Text style={styles.nome}>
              {perfil.nome}
              {perfil.ehVoce ? ' (você)' : ''}
            </Text>
            <Text style={styles.nivel}>
              {nivel.titulo} · Nível {nivel.nivel}
            </Text>
            <Text style={styles.desde}>
              Jogador desde {new Date(perfil.membroDesde).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </Text>
          </View>

          <View style={styles.numeros}>
            <Numero valor={`${perfil.posicao}º`} rotulo="Ranking" />
            <Numero valor={perfil.pontuacaoTotal.toLocaleString('pt-BR')} rotulo="Pontos" />
            <Numero valor={String(perfil.locaisColetados)} rotulo="Locais" />
          </View>

          <Text style={styles.secao}>Desafios 1x1</Text>
          <View style={styles.numeros}>
            <Numero valor={String(vitorias)} rotulo={vitorias === 1 ? 'Vitória' : 'Vitórias'} />
            <Numero valor={String(derrotas)} rotulo={derrotas === 1 ? 'Derrota' : 'Derrotas'} />
            <Numero valor={String(empates)} rotulo={empates === 1 ? 'Empate' : 'Empates'} />
          </View>

          <Text style={styles.secao}>
            Conquistas · {desbloqueadas}/{perfil.conquistas.length}
          </Text>
          <View style={styles.selos}>
            {perfil.conquistas.map((c, i) => (
              <SeloConquista
                key={c.id}
                conquista={c}
                posicao={i}
                onPress={() => mostrarConquista(c.titulo, c.descricao, c.desbloqueada)}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.fechar} onPress={onFechar} accessibilityRole="button">
            <Text style={styles.fecharTexto}>Fechar</Text>
          </TouchableOpacity>
        </>
      )}
    </FolhaInferior>
  );
}

function Numero({ valor, rotulo }: { valor: string; rotulo: string }) {
  const styles = useEstilos(criarEstilos);
  return (
    <View style={styles.numero}>
      <Text style={styles.numeroValor}>{valor}</Text>
      <Text style={styles.numeroRotulo}>{rotulo}</Text>
    </View>
  );
}

const criarEstilos = (cores: Tema) =>
  StyleSheet.create({
    estado: { marginVertical: 32, textAlign: 'center' },
    erro: { color: cores.textSecondary, fontSize: 14 },
    topo: { alignItems: 'center', marginBottom: 16 },
    nome: { fontSize: 22, fontWeight: '800', color: cores.textPrimary, marginTop: 10 },
    nivel: { fontSize: 14, fontWeight: '700', color: cores.textSecondary, marginTop: 2 },
    desde: { fontSize: 12, color: cores.textMuted, marginTop: 2 },
    numeros: {
      flexDirection: 'row',
      backgroundColor: cores.background,
      borderRadius: 12,
      paddingVertical: 14,
      marginBottom: 16,
    },
    numero: { flex: 1, alignItems: 'center' },
    numeroValor: { fontSize: 18, fontWeight: '800', color: cores.textPrimary },
    numeroRotulo: { fontSize: 11, color: cores.textSecondary, marginTop: 2 },
    secao: { fontSize: 14, fontWeight: '800', color: cores.textPrimary, marginBottom: 8 },
    selos: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
    fechar: { paddingVertical: 12, alignItems: 'center', marginTop: 4 },
    fecharTexto: { color: cores.textSecondary, fontWeight: '700', fontSize: 14 },
  });
