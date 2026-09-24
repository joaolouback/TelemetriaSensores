import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { BottomTabs } from './src/navigation/BottomTabs';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { TelemetriaProvider } from './src/contexts/TelemetriaContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegistroScreen } from './src/screens/RegistroScreen';
import { HOME_COLORS } from './src/constants';

/** Mostra as telas de login/registro ou as abas do app, conforme a sessão. */
function Conteudo() {
  const { usuario, carregando } = useAuth();
  const [telaAuth, setTelaAuth] = useState<'login' | 'registro'>('login');

  if (carregando) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: HOME_COLORS.background }}>
        <ActivityIndicator size="large" color={HOME_COLORS.accent} />
      </View>
    );
  }

  if (!usuario) {
    return telaAuth === 'login' ? (
      <LoginScreen irParaRegistro={() => setTelaAuth('registro')} />
    ) : (
      <RegistroScreen irParaLogin={() => setTelaAuth('login')} />
    );
  }

  return <BottomTabs />;
}

export default function App() {
  // TelemetriaProvider fica acima da checagem de login: a coleta começa
  // assim que o app abre, mesmo antes de o usuário entrar.
  return (
    <AuthProvider>
      <TelemetriaProvider>
        <Conteudo />
      </TelemetriaProvider>
    </AuthProvider>
  );
}
