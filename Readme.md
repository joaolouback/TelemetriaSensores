# Telemetria Sensores (PoC)

Aplicativo offline-first desenvolvido em React Native e Expo (SDK 54), com foco na captura e persistência de dados de sensores de dispositivos Android.

## 🚀 Funcionalidades

- **Captura de GPS**: Latitude, longitude, precisão e timestamp (atualização a cada 30 segundos).
- **Acelerômetro**: Leitura em tempo real dos eixos X, Y, Z e cálculo da magnitude (atualização a cada 1000ms).
- **Bateria**: Monitoramento do nível de carga e status de carregamento.
- **Conectividade**: Monitoramento em tempo real do estado de rede (Wi-Fi, Dados Móveis ou Offline).
- **Armazenamento Offline**: Persistência de dados coletados no dispositivo utilizando SQLite (`expo-sqlite`). Os logs são gravados em "lotes" a cada 30 segundos para preservação de bateria.

## 🛠️ Tecnologias Utilizadas

- **React Native** com **Expo** (SDK 54)
- **TypeScript** para ponta-a-ponta
- **SQLite** (`expo-sqlite`) gerenciar os dados tabulares localmente no aparelho
- **Componentes de Sistema**:
  - `expo-location`
  - `expo-sensors`
  - `expo-battery`
  - `@react-native-community/netinfo`

## 📁 Arquitetura do Projeto

A arquitetura do projeto segue a separação por responsabilidades:
```
src/
├── components/     → Componentes visuais isolados (SensorCard, ActionButton, StatusBadge)
├── constants/      → Constantes do sistema (cores, intervalos, timers)
├── database/       → Abstrações e instâncias CRUD do SQLite
├── hooks/          → Hooks para gerenciar lógicas globais (uso dos sensores, sqlite, timer de coleta)
├── screens/        → Telas principais e de controle da UI (DashboardScreen)
├── sensors/        → Isolamento da lógica de listeners de sensores nativos
├── types/          → Interfaces TypeScript e Enums 
└── utils/          → Funções auxiliares (matemática, formatação)
```

## 📱 Executando o Projeto

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor do Expo:
   ```bash
   npm start
   ```

3. Abra o aplicativo instalado em seu dispositivo Android e escaneie o QRCode utilizando o aplicativo oficial **Expo Go** do Google Play.

## 📝 Regras de Negócio e Testes Atuais

No momento atual, seu projeto **não conta com backend ou cloud sync**. O foco é demonstrar a capacidade e resiliência das bibliotecas do SO com armazenamento local operando de modo funcional e harmonioso offline.

- Pode limpar o banco quando não estiver gravando;
- Os hooks re-renderizam a UI apenas em intervalos pré-concebidos (ex.: a cada 1s de aceleração e a cada 30s de update fixo);

---
*Desenvolvido como Prova de Conceito para validações de coleta de telemetria mobile offline-first.*
