/** Tela de Registro (criação de conta) — UVV Go */
import React, { useRef, useState } from 'react';
import { TextInput } from 'react-native';
import { AuthLayout } from './AuthLayout';
import { CampoTexto } from '../components/CampoTexto';
import { useAuth } from '../contexts/AuthContext';
import { AuthError } from '../services/auth';
import { validarEmail } from '../utils';

/** Mesmo mínimo exigido pelo backend (authController). */
const SENHA_MIN = 6;

interface RegistroScreenProps {
  irParaLogin: () => void;
}

type Campo = 'nome' | 'email' | 'senha' | 'confirmacao';

export function RegistroScreen({ irParaLogin }: RegistroScreenProps) {
  const { cadastrar } = useAuth();
  const [valores, setValores] = useState<Record<Campo, string>>({
    nome: '',
    email: '',
    senha: '',
    confirmacao: '',
  });
  const [erros, setErros] = useState<Partial<Record<Campo, string>>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const senhaRef = useRef<TextInput>(null);
  const confirmacaoRef = useRef<TextInput>(null);

  const alterar = (campo: Campo) => (valor: string) => {
    setValores((v) => ({ ...v, [campo]: valor }));
    if (erros[campo]) setErros((e) => ({ ...e, [campo]: undefined }));
  };

  const enviar = async () => {
    const novosErros: Partial<Record<Campo, string>> = {};
    if (valores.nome.trim().length < 2) novosErros.nome = 'Informe seu nome.';
    if (!validarEmail(valores.email)) novosErros.email = 'Informe um e-mail válido.';
    if (valores.senha.length < SENHA_MIN) {
      novosErros.senha = `A senha deve ter pelo menos ${SENHA_MIN} caracteres.`;
    }
    if (valores.confirmacao !== valores.senha) novosErros.confirmacao = 'As senhas não coincidem.';
    setErros(novosErros);
    setErroGeral(null);
    if (Object.keys(novosErros).length > 0) return;

    setCarregando(true);
    try {
      await cadastrar(valores.nome, valores.email, valores.senha);
    } catch (err) {
      setErroGeral(err instanceof AuthError ? err.message : 'Não foi possível criar a conta. Tente novamente.');
      setCarregando(false);
    }
  };

  return (
    <AuthLayout
      titulo="Criar conta"
      subtitulo="Cadastre-se para pontuar e entrar no ranking."
      erro={erroGeral}
      botao={{ rotulo: 'Criar conta', onPress: enviar, carregando }}
      rodape={{ texto: 'Já tem conta?', link: 'Entrar', onPress: irParaLogin }}
    >
      <CampoTexto
        rotulo="Nome"
        icone="person-outline"
        placeholder="Seu nome"
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
        value={valores.nome}
        onChangeText={alterar('nome')}
        onSubmitEditing={() => emailRef.current?.focus()}
        erro={erros.nome}
        editable={!carregando}
      />
      <CampoTexto
        ref={emailRef}
        rotulo="E-mail"
        icone="mail-outline"
        placeholder="seu.nome@aluno.uvv.br"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        value={valores.email}
        onChangeText={alterar('email')}
        onSubmitEditing={() => senhaRef.current?.focus()}
        erro={erros.email}
        editable={!carregando}
      />
      <CampoTexto
        ref={senhaRef}
        rotulo="Senha"
        icone="lock-closed-outline"
        placeholder={`Mínimo ${SENHA_MIN} caracteres`}
        senha
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        value={valores.senha}
        onChangeText={alterar('senha')}
        onSubmitEditing={() => confirmacaoRef.current?.focus()}
        erro={erros.senha}
        editable={!carregando}
      />
      <CampoTexto
        ref={confirmacaoRef}
        rotulo="Confirmar senha"
        icone="shield-checkmark-outline"
        placeholder="Repita a senha"
        senha
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        value={valores.confirmacao}
        onChangeText={alterar('confirmacao')}
        onSubmitEditing={enviar}
        erro={erros.confirmacao}
        editable={!carregando}
      />
    </AuthLayout>
  );
}
