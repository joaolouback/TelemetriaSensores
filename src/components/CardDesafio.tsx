/**
 * Card do desafio 1x1 na tela Início.
 *
 * - sem desafio: criar um ou entrar com o código de um amigo;
 * - aguardando: mostra o código para compartilhar e a validade do convite;
 * - em andamento: placar ponto a ponto e o tempo restante;
 * - finalizado: vitória, derrota ou empate.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { HOME_COLORS } from '../constants';
import { useDesafio } from '../contexts/DesafioContext';
import { useTempoRestante } from '../hooks/useTempoRestante';
import { DesafioError } from '../services/desafios';
import { Desafio } from '../types';
import { COR_DESAFIO } from './PlacarDesafio';

const primeiroNome = (nome?: string) => nome?.trim().split(/\s+/)[0] ?? 'Oponente';

export function CardDesafio() {
  const { desafio, ajusteRelogio, criar, entrar, sair, dispensarResultado } = useDesafio();
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  /** Executa uma ação mostrando carregamento e a mensagem de erro, se houver. */
  const executar = async (acao: () => Promise<void>) => {
    setOcupado(true);
    setErro(null);
    try {
      await acao();
    } catch (e) {
      setErro(e instanceof DesafioError ? e.message : 'Não foi possível concluir. Tente de novo.');
    } finally {
      setOcupado(false);
    }
  };

  let conteudo: React.ReactNode;
  if (!desafio || desafio.status === 'CANCELADO' || desafio.status === 'EXPIRADO') {
    conteudo = <SemDesafio ocupado={ocupado} onCriar={() => executar(criar)} onEntrar={(c) => executar(() => entrar(c))} />;
  } else if (desafio.status === 'AGUARDANDO') {
    conteudo = (
      <Aguardando
        desafio={desafio}
        ajusteRelogio={ajusteRelogio}
        ocupado={ocupado}
        onCancelar={() => executar(sair)}
      />
    );
  } else if (desafio.status === 'EM_ANDAMENTO') {
    conteudo = (
      <EmAndamento
        desafio={desafio}
        ajusteRelogio={ajusteRelogio}
        onDesistir={() =>
          Alert.alert('Desistir do desafio?', `${primeiroNome(desafio.oponente?.nome)} vence e leva o bônus.`, [
            { text: 'Continuar jogando', style: 'cancel' },
            { text: 'Desistir', style: 'destructive', onPress: () => executar(sair) },
          ])
        }
      />
    );
  } else {
    conteudo = <Resultado desafio={desafio} onFechar={dispensarResultado} />;
  }

  return (
    <View style={styles.card}>
      {conteudo}
      {erro && <Text style={styles.erro}>{erro}</Text>}
    </View>
  );
}

function SemDesafio(props: { ocupado: boolean; onCriar: () => void; onEntrar: (codigo: string) => void }) {
  const [digitando, setDigitando] = useState(false);
  const [codigo, setCodigo] = useState('');

  return (
    <>
      <Text style={styles.titulo}>⚔️ Desafio 1x1</Text>
      <Text style={styles.texto}>
        Desafie um amigo: 3 pontos sorteados, 1 hora de prazo. Quem coletar todos primeiro ganha +20 pontos.
      </Text>

      {digitando ? (
        <View style={styles.linhaCodigo}>
          <TextInput
            style={styles.inputCodigo}
            value={codigo}
            onChangeText={(t) => setCodigo(t.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
            placeholder="CÓDIGO"
            placeholderTextColor={HOME_COLORS.textMuted}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
            autoFocus
          />
          <Botao
            texto="Entrar"
            onPress={() => props.onEntrar(codigo)}
            desabilitado={codigo.length !== 6}
            ocupado={props.ocupado}
            compacto
          />
        </View>
      ) : (
        <View style={styles.botoes}>
          <Botao texto="Criar desafio" onPress={props.onCriar} ocupado={props.ocupado} />
          <Botao texto="Tenho um código" onPress={() => setDigitando(true)} secundario />
        </View>
      )}
    </>
  );
}

function Aguardando(props: { desafio: Desafio; ajusteRelogio: number; ocupado: boolean; onCancelar: () => void }) {
  const { desafio } = props;
  const { texto } = useTempoRestante(desafio.conviteExpiraEm, props.ajusteRelogio);

  const compartilhar = () =>
    Share.share({
      message: `Te desafio no UVV Go! ⚔️ Abra o app, toque em "Tenho um código" e digite: ${desafio.codigo}`,
    }).catch(() => undefined);

  return (
    <>
      <Text style={styles.titulo}>⚔️ Esperando seu adversário</Text>
      <Text style={styles.texto}>Mande este código para quem você quer desafiar:</Text>
      <Text style={styles.codigo} selectable>
        {desafio.codigo}
      </Text>
      <Text style={styles.textoPequeno}>Convite vale por mais {texto}. A partida começa quando ele entrar.</Text>
      <View style={styles.botoes}>
        <Botao texto="Compartilhar código" onPress={compartilhar} />
        <Botao texto="Cancelar" onPress={props.onCancelar} ocupado={props.ocupado} secundario />
      </View>
    </>
  );
}

function EmAndamento(props: { desafio: Desafio; ajusteRelogio: number; onDesistir: () => void }) {
  const { desafio } = props;
  const { texto } = useTempoRestante(desafio.terminaEm, props.ajusteRelogio);
  const meus = new Set(desafio.eu.coletados);
  const dele = new Set(desafio.oponente?.coletados ?? []);
  const oponente = primeiroNome(desafio.oponente?.nome);

  return (
    <>
      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>⚔️ Você × {oponente}</Text>
        <Text style={styles.tempo}>⏱ {texto}</Text>
      </View>
      <Text style={styles.texto}>Os pontos do desafio estão em laranja no mapa.</Text>

      <View style={styles.tabela}>
        <View style={styles.linha}>
          <Text style={[styles.celulaPonto, styles.cabecalhoTabela]}>Ponto</Text>
          <Text style={[styles.celula, styles.cabecalhoTabela]}>Você</Text>
          <Text style={[styles.celula, styles.cabecalhoTabela]} numberOfLines={1}>
            {oponente}
          </Text>
        </View>
        {desafio.pontos.map((p) => (
          <View key={p.id} style={styles.linha}>
            <Text style={styles.celulaPonto} numberOfLines={1}>
              {p.nome}
            </Text>
            <Text style={styles.celula}>{meus.has(p.id) ? '✅' : '⬜'}</Text>
            <Text style={styles.celula}>{dele.has(p.id) ? '✅' : '⬜'}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity onPress={props.onDesistir} activeOpacity={0.7}>
        <Text style={styles.desistir}>Desistir</Text>
      </TouchableOpacity>
    </>
  );
}

function Resultado(props: { desafio: Desafio; onFechar: () => void }) {
  const { desafio } = props;
  const total = desafio.pontos.length;
  const placar = `${desafio.eu.coletados.length}/${total} × ${desafio.oponente?.coletados.length ?? 0}/${total}`;
  const oponente = primeiroNome(desafio.oponente?.nome);

  const [titulo, texto] =
    desafio.resultado === 'vitoria'
      ? ['🏆 Vitória!', `Você venceu ${oponente} e ganhou +${desafio.bonusVitoria} pontos.`]
      : desafio.resultado === 'derrota'
        ? ['😓 Não foi dessa vez', `${oponente} venceu o desafio. Que tal uma revanche?`]
        : ['🤝 Empate', 'O tempo acabou com os dois empatados.'];

  return (
    <>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.texto}>{texto}</Text>
      <Text style={styles.placarFinal}>{placar}</Text>
      <View style={styles.botoes}>
        <Botao texto="Fechar" onPress={props.onFechar} secundario />
      </View>
    </>
  );
}

function Botao(props: {
  texto: string;
  onPress: () => void;
  secundario?: boolean;
  ocupado?: boolean;
  desabilitado?: boolean;
  compacto?: boolean;
}) {
  const inativo = props.ocupado || props.desabilitado;
  return (
    <TouchableOpacity
      style={[
        styles.botao,
        props.secundario && styles.botaoSecundario,
        props.compacto && styles.botaoCompacto,
        inativo && styles.botaoInativo,
      ]}
      onPress={props.onPress}
      disabled={inativo}
      activeOpacity={0.85}
    >
      {props.ocupado ? (
        <ActivityIndicator color={props.secundario ? COR_DESAFIO : '#FFFFFF'} />
      ) : (
        <Text style={[styles.botaoTexto, props.secundario && styles.botaoTextoSecundario]}>{props.texto}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: HOME_COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: COR_DESAFIO,
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titulo: {
    color: HOME_COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '800',
  },
  tempo: {
    color: COR_DESAFIO,
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  texto: {
    color: HOME_COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  textoPequeno: {
    color: HOME_COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  codigo: {
    color: COR_DESAFIO,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 8,
    textAlign: 'center',
    marginTop: 10,
    fontVariant: ['tabular-nums'],
  },
  botoes: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  botao: {
    flex: 1,
    backgroundColor: COR_DESAFIO,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
  },
  botaoSecundario: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COR_DESAFIO,
  },
  botaoCompacto: {
    flex: 0,
    paddingHorizontal: 18,
  },
  botaoInativo: {
    opacity: 0.5,
  },
  botaoTexto: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  botaoTextoSecundario: {
    color: COR_DESAFIO,
  },
  linhaCodigo: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  inputCodigo: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: HOME_COLORS.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 6,
    color: HOME_COLORS.textPrimary,
  },
  tabela: {
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: HOME_COLORS.background,
    paddingVertical: 4,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  cabecalhoTabela: {
    color: HOME_COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  celulaPonto: {
    flex: 1,
    color: HOME_COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  celula: {
    width: 64,
    textAlign: 'center',
    fontSize: 15,
  },
  desistir: {
    color: HOME_COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
    textDecorationLine: 'underline',
  },
  placarFinal: {
    color: HOME_COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 10,
    fontVariant: ['tabular-nums'],
  },
  erro: {
    color: '#B91C1C',
    fontSize: 13,
    marginTop: 10,
    textAlign: 'center',
  },
});
