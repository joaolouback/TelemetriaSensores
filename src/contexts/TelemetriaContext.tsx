/**
 * Contexto da coleta de telemetria.
 *
 * A coleta vive aqui, no topo do app, e não mais dentro da aba Sensores:
 * assim ela começa sozinha assim que o app abre (inclusive na tela de login)
 * e continua rodando enquanto o usuário navega entre as abas.
 * Os dados são sempre gravados primeiro no SQLite (offline-first) e
 * sincronizados com o backend quando houver rede.
 */
import React, { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import { useSensors } from '../hooks/useSensors';
import { useDatabase } from '../hooks/useDatabase';
import { useDataCollection } from '../hooks/useDataCollection';

type TelemetriaContextValue = ReturnType<typeof useSensors> &
  ReturnType<typeof useDatabase> &
  ReturnType<typeof useDataCollection> & {
    iniciar: () => Promise<void>;
    parar: () => void;
  };

const TelemetriaContext = createContext<TelemetriaContextValue | null>(null);

export function TelemetriaProvider({ children }: { children: React.ReactNode }) {
  const sensores = useSensors();
  const banco = useDatabase();
  const coleta = useDataCollection({
    sensorState: sensores.sensorState,
    onSaved: banco.refreshStorageInfo,
  });

  const { startSensors, stopSensors } = sensores;
  const { startCollection, stopCollection } = coleta;

  const iniciar = useCallback(async () => {
    await startSensors();
    startCollection();
  }, [startSensors, startCollection]);

  const parar = useCallback(() => {
    stopCollection();
    stopSensors();
  }, [stopCollection, stopSensors]);

  // Início automático: assim que o SQLite estiver pronto, liga sensores e coleta.
  const autoIniciado = useRef(false);
  useEffect(() => {
    if (banco.isReady && !autoIniciado.current) {
      autoIniciado.current = true;
      console.log('[Telemetria] Banco pronto — iniciando coleta automática.');
      iniciar().catch((err) => console.error('[Telemetria] Falha ao iniciar coleta:', err));
    }
  }, [banco.isReady, iniciar]);

  return (
    <TelemetriaContext.Provider value={{ ...sensores, ...banco, ...coleta, iniciar, parar }}>
      {children}
    </TelemetriaContext.Provider>
  );
}

export function useTelemetria(): TelemetriaContextValue {
  const ctx = useContext(TelemetriaContext);
  if (!ctx) throw new Error('useTelemetria deve ser usado dentro de <TelemetriaProvider>.');
  return ctx;
}
