/** Tela principal (Dashboard) que exibe as leituras dos sensores em tempo real */
import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { SensorCard, DataRow } from '../components/SensorCard';
import { StatusBadge } from '../components/StatusBadge';
import { ActionButton } from '../components/ActionButton';
import { useSensors } from '../hooks/useSensors';
import { useDatabase } from '../hooks/useDatabase';
import { useDataCollection } from '../hooks/useDataCollection';
import { CollectionStatus } from '../types';
import { COLORS } from '../constants';
import { formatNumber, formatBatteryLevel, formatTimestamp, getNetworkLabel } from '../utils';

export function DashboardScreen() {
  const {
    sensorState,
    location,
    accelerometer,
    battery,
    connectivity,
    startSensors,
    stopSensors,
  } = useSensors();

  const { isReady, storageInfo, refreshStorageInfo, clearDatabase } = useDatabase();

  const { status, saveCount, startCollection, stopCollection } = useDataCollection({
    sensorState,
    onSaved: refreshStorageInfo,
  });

  const isCollecting = status === CollectionStatus.COLLECTING;

  const handleStart = useCallback(async () => {
    await startSensors();
    startCollection();
  }, [startSensors, startCollection]);

  const handleStop = useCallback(() => {
    stopCollection();
    stopSensors();
  }, [stopCollection, stopSensors]);

  const handleClear = useCallback(() => {
    Alert.alert(
      'Limpar Dados',
      'Tem certeza que deseja apagar todos os registros locais?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            await clearDatabase();
          },
        },
      ]
    );
  }, [clearDatabase]);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Inicializando banco de dados...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Telemetria Sensores</Text>
        <StatusBadge
          label={isCollecting ? 'Coletando' : status === CollectionStatus.STOPPED ? 'Parado' : 'Inativo'}
          isActive={isCollecting}
          activeColor={COLORS.success}
          inactiveColor={status === CollectionStatus.STOPPED ? COLORS.warning : COLORS.textMuted}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SensorCard title="Localização" color={COLORS.gps} isActive={!!location}>
          <DataRow label="Latitude" value={formatNumber(location?.latitude, 6)} />
          <DataRow label="Longitude" value={formatNumber(location?.longitude, 6)} />
          <DataRow label="Precisão" value={location?.accuracy ? `${formatNumber(location.accuracy, 1)}m` : '—'} />
          <DataRow
            label="Timestamp"
            value={location?.timestamp ? formatTimestamp(location.timestamp) : '—'}
          />
        </SensorCard>

        <SensorCard title="Acelerômetro" color={COLORS.accelerometer} isActive={!!accelerometer}>
          <DataRow label="Eixo X" value={formatNumber(accelerometer?.x)} color={COLORS.danger} />
          <DataRow label="Eixo Y" value={formatNumber(accelerometer?.y)} color={COLORS.success} />
          <DataRow label="Eixo Z" value={formatNumber(accelerometer?.z)} color={COLORS.info} />
          <DataRow
            label="Magnitude"
            value={formatNumber(accelerometer?.magnitude, 2)}
            color={COLORS.accelerometer}
          />
        </SensorCard>

        <SensorCard title="Bateria" color={COLORS.battery} isActive={battery !== null}>
          <DataRow
            label="Nível"
            value={formatBatteryLevel(battery?.level)}
            color={
              battery && battery.level < 0.2
                ? COLORS.danger
                : battery && battery.level < 0.5
                  ? COLORS.warning
                  : COLORS.success
            }
          />
          <DataRow
            label="Carregando"
            value={battery ? (battery.isCharging ? ' Sim' : 'Não') : '—'}
            color={battery?.isCharging ? COLORS.success : COLORS.textSecondary}
          />
        </SensorCard>

        <SensorCard title="Conectividade" color={COLORS.connectivity} isActive={connectivity.isConnected}>
          <View style={styles.badgeRow}>
            <StatusBadge
              label="Wi-Fi"
              isActive={connectivity.type === 'wifi'}
              activeColor={COLORS.info}
            />
            <StatusBadge
              label="Dados Móveis"
              isActive={connectivity.type === 'cellular'}
              activeColor={COLORS.success}
            />
            <StatusBadge
              label="Offline"
              isActive={connectivity.type === 'none'}
              activeColor={COLORS.danger}
            />
          </View>
          <DataRow
            label="Status"
            value={getNetworkLabel(connectivity.type)}
            color={connectivity.isConnected ? COLORS.success : COLORS.danger}
          />
        </SensorCard>

        <SensorCard title="Armazenamento" color={COLORS.storage} isActive={storageInfo.recordCount > 0}>
          <DataRow
            label="Registros SQLite"
            value={storageInfo.recordCount.toString()}
            color={COLORS.storage}
          />
          <DataRow
            label="Salvos nesta sessão"
            value={saveCount.toString()}
          />
          <DataRow
            label="Último registro"
            value={
              storageInfo.lastRecord?.created_at
                ? formatTimestamp(storageInfo.lastRecord.created_at)
                : '—'
            }
          />
        </SensorCard>

        <View style={styles.buttonContainer}>
          {!isCollecting ? (
            <ActionButton
              label="Iniciar Coleta"
              onPress={handleStart}
              variant="success"
            />
          ) : (
            <ActionButton
              label="Parar Coleta"
              onPress={handleStop}
              variant="danger"
            />
          )}
        </View>

        <View style={styles.buttonContainer}>
          <ActionButton
            label="Limpar Dados"
            onPress={handleClear}
            variant="outline"
            disabled={isCollecting || storageInfo.recordCount === 0}
          />
        </View>


        <Text style={styles.footer}>
          SensorTelemetryApp v1.0
        </Text>

        <Text style={styles.footer}>
          Offline-First Mobile Telemetry System
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  footer: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 12,
    marginBottom: 8,
  },
});
