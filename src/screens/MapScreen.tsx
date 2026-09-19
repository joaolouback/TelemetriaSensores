/**
 * Tela do Mapa do Campus (CS02 — Consultar Mapa Interativo).
 *
 * Mostra a posição do usuário em tempo real, os pontos de coleta vindos da API,
 * o raio de geofence de cada ponto e o trajeto percorrido durante a sessão.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MapView, { Marker, Circle, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useLiveLocation } from '../hooks/useLiveLocation';
import { usePontos } from '../hooks/usePontos';
import { COLORS, CAMPUS_UVV, MAP_DEFAULT_DELTA } from '../constants';
import { formatDistancia, formatNumber } from '../utils';
import { PontoComDistancia } from '../types';
import { MAP_DARK_STYLE } from '../constants/mapStyle';

const REGIAO_INICIAL: Region = {
  latitude: CAMPUS_UVV.latitude,
  longitude: CAMPUS_UVV.longitude,
  latitudeDelta: MAP_DEFAULT_DELTA,
  longitudeDelta: MAP_DEFAULT_DELTA,
};

export function MapScreen() {
  const { localizacao, trajeto, permissao, erro: erroLocal, limparTrajeto } = useLiveLocation(true);
  const {
    pontosComDistancia,
    pontoMaisProximo,
    pontosAtivos,
    carregando,
    erro: erroPontos,
    recarregar,
  } = usePontos(localizacao);

  const mapRef = useRef<MapView | null>(null);
  const [seguindoUsuario, setSeguindoUsuario] = useState(true);
  const [pontoSelecionado, setPontoSelecionado] = useState<PontoComDistancia | null>(null);
  const jaCentralizou = useRef(false);

  /** Centraliza a câmera na posição do usuário. */
  const centralizar = useCallback(
    (animado: boolean = true) => {
      if (!localizacao || !mapRef.current) return;

      const regiao: Region = {
        latitude: localizacao.latitude,
        longitude: localizacao.longitude,
        latitudeDelta: MAP_DEFAULT_DELTA,
        longitudeDelta: MAP_DEFAULT_DELTA,
      };

      if (animado) {
        mapRef.current.animateToRegion(regiao, 600);
      } else {
        mapRef.current.setCamera({
          center: { latitude: localizacao.latitude, longitude: localizacao.longitude },
        });
      }
    },
    [localizacao]
  );

  // Centraliza uma única vez assim que a primeira posição chega.
  useEffect(() => {
    if (localizacao && !jaCentralizou.current) {
      jaCentralizou.current = true;
      centralizar(true);
    }
  }, [localizacao, centralizar]);

  // Enquanto o modo "seguir" estiver ligado, acompanha o usuário andando.
  useEffect(() => {
    if (seguindoUsuario && localizacao && jaCentralizou.current && mapRef.current) {
      mapRef.current.animateCamera(
        { center: { latitude: localizacao.latitude, longitude: localizacao.longitude } },
        { duration: 500 }
      );
    }
  }, [localizacao, seguindoUsuario]);

  const handleRecentralizar = useCallback(() => {
    setSeguindoUsuario(true);
    centralizar(true);
  }, [centralizar]);

  if (permissao === 'negada') {
    return (
      <View style={styles.centro}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <Text style={styles.tituloErro}>Localização bloqueada</Text>
        <Text style={styles.textoErro}>{erroLocal}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        customMapStyle={MAP_DARK_STYLE}
        initialRegion={REGIAO_INICIAL}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
        toolbarEnabled={false}
        // Se o usuário arrastar o mapa, desliga o auto-seguir para não brigar com ele.
        onPanDrag={() => setSeguindoUsuario(false)}
      >
        {pontosComDistancia.map((ponto) => (
          <React.Fragment key={ponto.id}>
            <Circle
              center={{ latitude: ponto.latitude, longitude: ponto.longitude }}
              radius={ponto.raioGeofence}
              strokeWidth={2}
              strokeColor={ponto.dentroDoRaio ? COLORS.success : COLORS.primary}
              fillColor={
                ponto.dentroDoRaio
                  ? 'rgba(0, 214, 143, 0.25)'
                  : 'rgba(108, 99, 255, 0.12)'
              }
            />
            <Marker
              coordinate={{ latitude: ponto.latitude, longitude: ponto.longitude }}
              title={ponto.nome}
              description={
                Number.isNaN(ponto.distanciaMetros)
                  ? ponto.descricao ?? ''
                  : `${formatDistancia(ponto.distanciaMetros)} · ${ponto.pontosRecompensa} pts`
              }
              pinColor={ponto.dentroDoRaio ? COLORS.success : COLORS.primary}
              onPress={() => setPontoSelecionado(ponto)}
            />
          </React.Fragment>
        ))}

        {trajeto.length > 1 && (
          <Polyline
            coordinates={trajeto}
            strokeColor={COLORS.gps}
            strokeWidth={4}
          />
        )}
      </MapView>

      {/* Cabeçalho flutuante */}
      <View style={styles.header}>
        <View style={styles.headerTextos}>
          <Text style={styles.headerTitulo}>Mapa do Campus</Text>
          <Text style={styles.headerSubtitulo}>
            {localizacao
              ? `${formatNumber(localizacao.latitude, 5)}, ${formatNumber(localizacao.longitude, 5)}` +
                (localizacao.accuracy ? `  ±${Math.round(localizacao.accuracy)}m` : '')
              : 'Obtendo sinal de GPS...'}
          </Text>
        </View>
        {carregando && <ActivityIndicator color={COLORS.primary} />}
      </View>

      {/* Aviso de geofence ativo */}
      {pontosAtivos.length > 0 && (
        <View style={styles.alertaGeofence}>
          <Text style={styles.alertaTexto}>
            Você chegou em {pontosAtivos.map((p) => p.nome).join(', ')}
          </Text>
        </View>
      )}

      {erroPontos && (
        <TouchableOpacity style={styles.alertaErro} onPress={recarregar} activeOpacity={0.8}>
          <Text style={styles.alertaErroTexto}>{erroPontos}</Text>
          <Text style={styles.alertaErroAcao}>Toque para tentar de novo</Text>
        </TouchableOpacity>
      )}

      {/* Painel inferior */}
      <View style={styles.painel}>
        <View style={styles.painelLinha}>
          <View style={styles.painelInfo}>
            <Text style={styles.painelRotulo}>Ponto mais próximo</Text>
            <Text style={styles.painelValor} numberOfLines={1}>
              {pontoMaisProximo ? pontoMaisProximo.nome : '—'}
            </Text>
            <Text
              style={[
                styles.painelDistancia,
                pontoMaisProximo?.dentroDoRaio && { color: COLORS.success },
              ]}
            >
              {pontoMaisProximo ? formatDistancia(pontoMaisProximo.distanciaMetros) : '—'}
              {pontoMaisProximo?.dentroDoRaio ? '  · dentro do raio' : ''}
            </Text>
          </View>

          <View style={styles.painelBotoes}>
            <TouchableOpacity
              style={[styles.botao, seguindoUsuario && styles.botaoAtivo]}
              onPress={handleRecentralizar}
              activeOpacity={0.8}
            >
              <Text style={[styles.botaoTexto, seguindoUsuario && styles.botaoTextoAtivo]}>
                {seguindoUsuario ? 'Seguindo' : 'Centralizar'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.botaoSecundario}
              onPress={limparTrajeto}
              activeOpacity={0.8}
              disabled={trajeto.length === 0}
            >
              <Text style={styles.botaoSecundarioTexto}>
                Limpar rota ({trajeto.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Lista horizontal dos pontos ordenados por distância */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listaPontos}
        >
          {pontosComDistancia.map((ponto) => (
            <TouchableOpacity
              key={ponto.id}
              style={[
                styles.chip,
                ponto.dentroDoRaio && styles.chipAtivo,
                pontoSelecionado?.id === ponto.id && styles.chipSelecionado,
              ]}
              activeOpacity={0.8}
              onPress={() => {
                setPontoSelecionado(ponto);
                setSeguindoUsuario(false);
                mapRef.current?.animateToRegion(
                  {
                    latitude: ponto.latitude,
                    longitude: ponto.longitude,
                    latitudeDelta: MAP_DEFAULT_DELTA / 2,
                    longitudeDelta: MAP_DEFAULT_DELTA / 2,
                  },
                  600
                );
              }}
            >
              <Text style={styles.chipNome} numberOfLines={1}>
                {ponto.nome}
              </Text>
              <Text style={[styles.chipDistancia, ponto.dentroDoRaio && { color: COLORS.success }]}>
                {formatDistancia(ponto.distanciaMetros)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centro: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  tituloErro: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  textoErro: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 14,
    backgroundColor: 'rgba(26, 26, 46, 0.94)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTextos: {
    flex: 1,
  },
  headerTitulo: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 0.4,
  },
  headerSubtitulo: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 3,
    fontVariant: ['tabular-nums'],
  },
  alertaGeofence: {
    position: 'absolute',
    top: 116,
    left: 16,
    right: 16,
    backgroundColor: COLORS.success,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  alertaTexto: {
    color: COLORS.background,
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
  alertaErro: {
    position: 'absolute',
    top: 116,
    left: 16,
    right: 16,
    backgroundColor: COLORS.danger,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  alertaErroTexto: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
  },
  alertaErroAcao: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 3,
  },
  painel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(26, 26, 46, 0.97)',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 14,
    paddingBottom: 18,
  },
  painelLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  painelInfo: {
    flex: 1,
    marginRight: 12,
  },
  painelRotulo: {
    color: COLORS.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  painelValor: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  painelDistancia: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  painelBotoes: {
    gap: 6,
  },
  botao: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  botaoAtivo: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  botaoTexto: {
    color: COLORS.textSecondary,
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
  },
  botaoTextoAtivo: {
    color: '#FFFFFF',
  },
  botaoSecundario: {
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  botaoSecundarioTexto: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: 'center',
  },
  listaPontos: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 120,
  },
  chipAtivo: {
    borderColor: COLORS.success,
  },
  chipSelecionado: {
    backgroundColor: COLORS.surfaceElevated,
    borderColor: COLORS.primary,
  },
  chipNome: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  chipDistancia: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
});
