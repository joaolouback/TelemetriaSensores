import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { BottomTabs } from './src/navigation/BottomTabs';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { TelemetriaProvider, useTelemetria } from './src/contexts/TelemetriaContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegistroScreen } from './src/screens/RegistroScreen';
import { ConsentimentoScreen } from './src/screens/ConsentimentoScreen';
import { DesafioProvider } from './src/contexts/DesafioContext';
import { HOME_COLORS } from './src/constants';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErroBoundary } from './src/components/ErroBoundary';

/**
 * Mostra o consentimento (na primeira abertura), as telas de login/registro
 * ou as abas do app, conforme a sessão.
 */
function Conteudo() {
  const { usuario, carregando } = useAuth();
  const { consentimento } = useTelemetria();
  const [telaAuth, setTelaAuth] = useState<'login' | 'registro'>('login');

  if (carregando || consentimento === undefined) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: HOME_COLORS.background }}>
        <ActivityIndicator size="large" color={HOME_COLORS.accent} />
      </View>
    );
  }

  // LGPD: nenhuma telemetria é gravada antes de o usuário decidir.
  if (consentimento === null) {
    return <ConsentimentoScreen />;
  }

  if (!usuario) {
    return telaAuth === 'login' ? (
      <LoginScreen irParaRegistro={() => setTelaAuth('registro')} />
    ) : (
      <RegistroScreen irParaLogin={() => setTelaAuth('login')} />
    );
  }

  return (
    <DesafioProvider>
      <BottomTabs />
    </DesafioProvider>
  );
}

export default function App() {
  // TelemetriaProvider fica acima da checagem de login: com consentimento,
  // a coleta começa assim que o app abre, mesmo antes de o usuário entrar.
  return (
    <SafeAreaProvider>
      <ErroBoundary>
        <AuthProvider>
          <TelemetriaProvider>
            <Conteudo />
          </TelemetriaProvider>
        </AuthProvider>
      </ErroBoundary>
    </SafeAreaProvider>
  );
}
