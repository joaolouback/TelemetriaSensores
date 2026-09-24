/**
 * Contexto de autenticação.
 *
 * Ao abrir o app, restaura a sessão salva no SQLite — assim o usuário continua
 * logado mesmo offline. Login e registro precisam de rede (validação no backend).
 */
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Sessao, Usuario } from '../types';
import { getSessao, salvarSessao, limparSessao } from '../database/database';
import * as authService from '../services/auth';
import { syncLogsWithApi } from '../services/api';

interface AuthContextValue {
  usuario: Usuario | null;
  /** true enquanto a sessão salva ainda está sendo lida do SQLite. */
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  cadastrar: (nome: string, email: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    getSessao()
      .then((salva) => {
        authService.definirSessaoAtual(salva);
        setSessao(salva);
      })
      .catch((err) => console.error('[Auth] Erro ao restaurar sessão:', err))
      .finally(() => setCarregando(false));
  }, []);

  const aplicarSessao = useCallback(async (nova: Sessao) => {
    await salvarSessao(nova);
    authService.definirSessaoAtual(nova);
    setSessao(nova);
    // Envia já os registros coletados antes do login, agora associados ao usuário.
    syncLogsWithApi().catch(console.error);
  }, []);

  const entrar = useCallback(
    async (email: string, senha: string) => {
      await aplicarSessao(await authService.login(email.trim().toLowerCase(), senha));
    },
    [aplicarSessao]
  );

  const cadastrar = useCallback(
    async (nome: string, email: string, senha: string) => {
      await aplicarSessao(await authService.registrar(nome.trim(), email.trim().toLowerCase(), senha));
    },
    [aplicarSessao]
  );

  const sair = useCallback(async () => {
    // Última tentativa de enviar os dados deste usuário antes de trocar de conta.
    await syncLogsWithApi().catch(console.error);
    await limparSessao();
    authService.definirSessaoAtual(null);
    setSessao(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ usuario: sessao?.usuario ?? null, carregando, entrar, cadastrar, sair }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  return ctx;
}
