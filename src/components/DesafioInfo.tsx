/**
 * Painel do Desafio 1x1: como funciona, o placar de vitórias/derrotas/empates e o
 * histórico das últimas partidas. Aberto pelo link "Como funciona e histórico" do card.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { buscarPlacarDesafios } from '../services/desafios';
import { Desafio, PlacarDesafios, ResultadoDesafio } from '../types';
import { useTema, useEstilos } from '../contexts/TemaContext';
import type { Tema } from '../constants/temas';
import { COR_DESAFIO } from './PlacarDesafio';
import { FolhaInferior } from './FolhaInferior';

const PASSOS: { icone: keyof typeof Ionicons.glyphMap; titulo: string; texto: string }[] = [
  {
    icone: 'person-add-outline',
    titulo: 'Convide um amigo',
    texto: 'Toque em "Criar desafio" e envie o código de 6 letras. O convite vale por 30 minutos.',
  },
  {
    icone: 'flash-outline',
    titulo: 'A partida começa',
    texto: 'Quando o amigo entra com o código, sorteamos 3 locais do campus e começa uma corrida de 1 hora.',
  },
  {
    icone: 'diamond-outline',
    titulo: 'Colete os 3 cristais',
    texto: 'Os locais do desafio ficam em laranja no mapa. Vá até eles e colete o cristal em realidade aumentada.',
  },
  {
    icone: 'trophy-outline',
    titulo: 'Vença e ganhe bônus',
    texto:
      'Quem coletar os 3 primeiro ganha +20 pontos. Se o tempo acabar, vence quem coletou mais; empatando, ninguém leva o bônus.',
  },
];

const RESULTADO: Record<ResultadoDesafio, { rotulo: string; icone: keyof typeof Ionicons.glyphMap }> = {
  vitoria: { rotulo: 'Vitória', icone: 'trophy' },
  derrota: { rotulo: 'Derrota', icone: 'close-circle-outline' },
  empate: { rotulo: 'Empate', icone: 'remove-circle-outline' },
};

interface Props {
  visivel: boolean;
  onFechar: () => void;
}

export function DesafioInfo({ visivel, onFechar }: Props) {
  const styles = useEstilos(criarEstilos);
  const { cores } = useTema();
  const [dados, setDados] = useState<(PlacarDesafios & { desafios: Desafio[] }) | null>(null);
  const [erro, setErro] = useState(false);

  // Recarrega a cada abertura: o placar muda quando uma partida termina.
  useEffect(() => {
    if (!visivel) return;
    setErro(false);
    buscarPlacarDesafios()
      .then(setDados)
      .catch(() => setErro(true));
  }, [visivel]);

  return (
    <FolhaInferior visivel={visivel} titulo="Desafio 1x1" onFechar={onFechar}>
      <Text style={styles.intro}>
        Uma corrida de 1 hora contra um amigo pelos pontos do campus. Quem coletar os cristais primeiro vence.
      </Text>

      {PASSOS.map((passo, i) => (
        <View key={passo.titulo} style={styles.passo}>
          <View style={styles.passoIcone}>
            <Ionicons name={passo.icone} size={18} color={COR_DESAFIO} />
          </View>
          <View style={styles.passoTextos}>
            <Text style={styles.passoTitulo}>
              {i + 1}. {passo.titulo}
            </Text>
            <Text style={styles.passoTexto}>{passo.texto}</Text>
          </View>
        </View>
      ))}

      <Text style={styles.secao}>Seu placar</Text>
      <View style={styles.placar}>
        <Numero valor={dados?.vitorias} rotulo="Vitórias" />
        <Numero valor={dados?.derrotas} rotulo="Derrotas" />
        <Numero valor={dados?.empates} rotulo="Empates" />
      </View>

      <Text style={styles.secao}>Últimas partidas</Text>
      {!dados && !erro && <ActivityIndicator color={cores.accent} style={styles.estado} />}
      {erro && <Text style={styles.vazio}>Não foi possível carregar o histórico.</Text>}
      {dados && dados.desafios.length === 0 && (
        <Text style={styles.vazio}>Você ainda não terminou nenhum desafio. Chame um amigo!</Text>
      )}
      {dados?.desafios.map((d) => {
        const r = d.resultado ? RESULTADO[d.resultado] : null;
        return (
          <View key={d.id} style={styles.partida}>
            <Ionicons
              name={r?.icone ?? 'ellipse-outline'}
              size={22}
              color={d.resultado === 'vitoria' ? cores.success : cores.textMuted}
            />
            <View style={styles.partidaTextos}>
              <Text style={styles.partidaTitulo}>
                {r?.rotulo ?? 'Encerrado'} contra {d.oponente?.nome.trim().split(/\s+/)[0] ?? 'oponente'}
              </Text>
              <Text style={styles.partidaDetalhe}>
                {d.eu.coletados.length}/{d.pontos.length} × {d.oponente?.coletados.length ?? 0}/{d.pontos.length}
                {d.finalizadoEm ? ` · ${new Date(d.finalizadoEm).toLocaleDateString('pt-BR')}` : ''}
              </Text>
            </View>
          </View>
        );
      })}
    </FolhaInferior>
  );
}

function Numero({ valor, rotulo }: { valor: number | undefined; rotulo: string }) {
  const styles = useEstilos(criarEstilos);
  return (
    <View style={styles.numero}>
      <Text style={styles.numeroValor}>{valor ?? '–'}</Text>
      <Text style={styles.numeroRotulo}>{rotulo}</Text>
    </View>
  );
}

const criarEstilos = (cores: Tema) =>
  StyleSheet.create({
    intro: { fontSize: 14, lineHeight: 20, color: cores.textSecondary, marginBottom: 16 },
    passo: { flexDirection: 'row', marginBottom: 14 },
    passoIcone: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: cores.background,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    passoTextos: { flex: 1 },
    passoTitulo: { fontSize: 14, fontWeight: '800', color: cores.textPrimary },
    passoTexto: { fontSize: 13, lineHeight: 19, color: cores.textSecondary, marginTop: 2 },
    secao: { fontSize: 15, fontWeight: '800', color: cores.textPrimary, marginTop: 10, marginBottom: 10 },
    placar: {
      flexDirection: 'row',
      backgroundColor: cores.background,
      borderRadius: 12,
      paddingVertical: 14,
    },
    numero: { flex: 1, alignItems: 'center' },
    numeroValor: { fontSize: 20, fontWeight: '800', color: cores.textPrimary },
    numeroRotulo: { fontSize: 11, color: cores.textSecondary, marginTop: 2 },
    estado: { marginVertical: 16 },
    vazio: { fontSize: 13, color: cores.textSecondary, paddingVertical: 8 },
    partida: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: cores.cardBorder,
    },
    partidaTextos: { flex: 1, marginLeft: 12 },
    partidaTitulo: { fontSize: 14, fontWeight: '700', color: cores.textPrimary },
    partidaDetalhe: { fontSize: 12, color: cores.textSecondary, marginTop: 1 },
  });
