/**
 * Contexto da coleta de telemetria.
 *
 * A coleta vive aqui, no topo do app, e não mais dentro da aba Sensores:
 * assim ela continua rodando enquanto o usuário navega entre as abas.
 * Os dados são sempre gravados primeiro no SQLite (offline-first) e
 * sincronizados com o backend quando houver rede.
 *
 * LGPD: a telemetria inclui a localização, então só é coletada depois que o
 * usuário consente (tela de consentimento na primeira abertura, ou o
 * interruptor no Perfil). O jogo funciona sem ela — mapa e AR usam o GPS
 * na hora, sem gravar o histórico.
 */
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useSensors } from '../hooks/useSensors';
import { useDatabase } from '../hooks/useDatabase';
import { useDataCollection } from '../hooks/useDataCollection';
import {
  getConsentimentoTelemetria,
  salvarConsentimentoTelemetria,
  deleteUnsyncedLogs,
} from '../database/database';

type TelemetriaContextValue = ReturnType<typeof useSensors> &
  ReturnType<typeof useDatabase> &
  ReturnType<typeof useDataCollection> & {
    iniciar: () => Promise<void>;
    parar: () => void;
    /** `undefined` enquanto carrega; `null` se o usuário ainda não respondeu. */
    consentimento: boolean | null | undefined;
    /** Grava a decisão. Aceitar liga a coleta; recusar desliga e apaga o que não foi enviado. */
    definirConsentimento: (aceito: boolean) => Promise<void>;
  };

const TelemetriaContext = createContext<TelemetriaContextValue | null>(null);

export function TelemetriaProvider({ children }: { children: React.ReactNode }) {
  const sensores = useSensors();
  const banco = useDatabase();
  const coleta = useDataCollection({
    sensorState: sensores.sensorState,
    onSaved: banco.refreshStorageInfo,
  });
  const [consentimento, setConsentimento] = useState<boolean | null | undefined>(undefined);

  const { startSensors, stopSensors } = sensores;
  const { startCollection, stopCollection } = coleta;
  const { refreshStorageInfo } = banco;

  const iniciar = useCallback(async () => {
    await startSensors();
    startCollection();
  }, [startSensors, startCollection]);

  const parar = useCallback(() => {
    stopCollection();
    stopSensors();
  }, [stopCollection, stopSensors]);

  const definirConsentimento = useCallback(
    async (aceito: boolean) => {
      await salvarConsentimentoTelemetria(aceito);
      setConsentimento(aceito);

      if (aceito) {
        await iniciar();
      } else {
        parar();
        await deleteUnsyncedLogs();
        await refreshStorageInfo();
      }
    },
    [iniciar, parar, refreshStorageInfo]
  );

  // Ao abrir: lê a decisão salva e, se o usuário já tinha aceitado, liga a coleta.
  const autoIniciado = useRef(false);
  useEffect(() => {
    if (!banco.isReady || autoIniciado.current) return;
    autoIniciado.current = true;

    getConsentimentoTelemetria()
      .then(async (salvo) => {
        setConsentimento(salvo);
        if (salvo) {
          console.log('[Telemetria] Consentimento dado — iniciando coleta automática.');
          await iniciar();
        } else {
          console.log('[Telemetria] Sem consentimento — coleta desligada.');
        }
      })
      .catch((err) => console.error('[Telemetria] Falha ao iniciar coleta:', err));
  }, [banco.isReady, iniciar]);

  return (
    <TelemetriaContext.Provider
      value={{ ...sensores, ...banco, ...coleta, iniciar, parar, consentimento, definirConsentimento }}
    >
      {children}
    </TelemetriaContext.Provider>
  );
}

export function useTelemetria(): TelemetriaContextValue {
  const ctx = useContext(TelemetriaContext);
  if (!ctx) throw new Error('useTelemetria deve ser usado dentro de <TelemetriaProvider>.');
  return ctx;
}
