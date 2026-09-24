/** Tela de Login — UVV Go */
import React, { useRef, useState } from 'react';
import { TextInput } from 'react-native';
import { AuthLayout } from './AuthLayout';
import { CampoTexto } from '../components/CampoTexto';
import { useAuth } from '../contexts/AuthContext';
import { AuthError } from '../services/auth';
import { validarEmail } from '../utils';

interface LoginScreenProps {
  irParaRegistro: () => void;
}

export function LoginScreen({ irParaRegistro }: LoginScreenProps) {
  const { entrar } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState<{ email?: string; senha?: string }>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const senhaRef = useRef<TextInput>(null);

  const enviar = async () => {
    const novosErros: typeof erros = {};
    if (!validarEmail(email)) novosErros.email = 'Informe um e-mail válido.';
    if (!senha) novosErros.senha = 'Informe sua senha.';
    setErros(novosErros);
    setErroGeral(null);
    if (Object.keys(novosErros).length > 0) return;

    setCarregando(true);
    try {
      await entrar(email, senha);
    } catch (err) {
      setErroGeral(err instanceof AuthError ? err.message : 'Não foi possível entrar. Tente novamente.');
      setCarregando(false);
    }
  };

  return (
    <AuthLayout
      titulo="Entrar"
      subtitulo="Bem-vindo de volta! Acesse sua conta."
      erro={erroGeral}
      botao={{ rotulo: 'Entrar', onPress: enviar, carregando }}
      rodape={{ texto: 'Ainda não tem conta?', link: 'Cadastre-se', onPress: irParaRegistro }}
    >
      <CampoTexto
        rotulo="E-mail"
        icone="mail-outline"
        placeholder="seu.nome@aluno.uvv.br"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        value={email}
        onChangeText={(v) => {
          setEmail(v);
          if (erros.email) setErros((e) => ({ ...e, email: undefined }));
        }}
        onSubmitEditing={() => senhaRef.current?.focus()}
        erro={erros.email}
        editable={!carregando}
      />
      <CampoTexto
        ref={senhaRef}
        rotulo="Senha"
        icone="lock-closed-outline"
        placeholder="Sua senha"
        senha
        autoCapitalize="none"
        autoComplete="password"
        textContentType="password"
        returnKeyType="go"
        value={senha}
        onChangeText={(v) => {
          setSenha(v);
          if (erros.senha) setErros((e) => ({ ...e, senha: undefined }));
        }}
        onSubmitEditing={enviar}
        erro={erros.senha}
        editable={!carregando}
      />
    </AuthLayout>
  );
}
