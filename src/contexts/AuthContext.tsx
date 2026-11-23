/**
 * Contexto de autenticação.
 *
 * Ao abrir o app, restaura a sessão salva no SQLite — assim o usuário continua
 * logado mesmo offline. Login e registro precisam de rede (validação no backend).
 */
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
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
  /** Atualiza a pontuação do usuário (ex.: após um check-in) e persiste na sessão. */
  atualizarPontuacao: (pontuacaoTotal: number) => void;
  /** Troca os dados do usuário logado (ex.: nova foto de perfil) e persiste na sessão. */
  atualizarUsuario: (usuario: Usuario) => void;
  /** Busca no servidor os dados atuais do usuário (pontos, foto...). Sem rede, mantém os salvos. */
  recarregarUsuario: () => Promise<void>;
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

  const atualizarPontuacao = useCallback((pontuacaoTotal: number) => {
    setSessao((atual) => {
      if (!atual) return atual;
      const nova = { ...atual, usuario: { ...atual.usuario, pontuacaoTotal } };
      authService.definirSessaoAtual(nova);
      salvarSessao(nova).catch((err) => console.error('[Auth] Erro ao salvar pontuação:', err));
      return nova;
    });
  }, []);

  const atualizarUsuario = useCallback((usuario: Usuario) => {
    setSessao((atual) => {
      if (!atual) return atual;
      const nova = { ...atual, usuario };
      authService.definirSessaoAtual(nova);
      salvarSessao(nova).catch((err) => console.error('[Auth] Erro ao salvar usuário:', err));
      return nova;
    });
  }, []);

  const recarregarUsuario = useCallback(async () => {
    if (!authService.getToken()) return;
    try {
      atualizarUsuario(await authService.buscarUsuarioAtual());
    } catch (err) {
      // Offline ou servidor fora do ar: o app segue com os dados salvos no aparelho.
      console.warn('[Auth] Não foi possível atualizar os dados do usuário:', err instanceof Error ? err.message : err);
    }
  }, [atualizarUsuario]);

  // A sessão salva é uma cópia do login: ao abrir o app e ao voltar para ele, confere com o
  // servidor (a pontuação pode ter mudado por um desafio, por outro aparelho ou no banco).
  const token = sessao?.token;
  useEffect(() => {
    if (!token) return;
    recarregarUsuario();
    const sub = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') recarregarUsuario();
    });
    return () => sub.remove();
  }, [token, recarregarUsuario]);

  return (
    <AuthContext.Provider
      value={{
        usuario: sessao?.usuario ?? null,
        carregando,
        entrar,
        cadastrar,
        sair,
        atualizarPontuacao,
        atualizarUsuario,
        recarregarUsuario,
      }}
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
