# UVV Go — App

Aplicativo Android do projeto **UVV Go**: plataforma mobile gamificada baseada em
geolocalização e realidade aumentada para exploração do campus da Universidade Vila Velha.

Desenvolvido em React Native e Expo (SDK 54). Evoluído a partir da Prova de Conceito de
telemetria offline-first, que segue funcionando na aba *Sensores*.

> **Primeira vez neste projeto?** Este app precisa do **backend rodando** para
> carregar os pontos do campus. Siga o roteiro completo de instalação e teste no
> **`SETUP.md` do repositório `TelemetriaSensores_API`** — ele cobre as duas partes.

## 🚀 Funcionalidades

### Mapa do Campus
- **Localização em tempo real**: posição atualizada a cada ~1s, com o marcador se movendo no mapa.
- **Pontos de coleta**: os 10 pontos do campus carregados da API, com marcador e raio de geofence.
- **Detecção de proximidade**: o círculo fica verde e um aviso aparece ao entrar no raio de um ponto.
- **Trajeto percorrido**: o caminho é desenhado em tempo real (Polyline).
- **Ponto mais próximo**: distância ao vivo, calculada no aparelho — funciona sem rede.

### Telemetria (Prova de Conceito)
- **Captura de GPS**: latitude, longitude, precisão e timestamp (a cada 30 segundos).
- **Acelerômetro**: eixos X, Y, Z e cálculo da magnitude (a cada 1000ms).
- **Bateria**: nível de carga e status de carregamento.
- **Conectividade**: estado da rede (Wi-Fi, dados móveis ou offline).
- **Armazenamento offline**: persistência local em SQLite (`expo-sqlite`), gravando em
  lotes a cada 30 segundos para preservar bateria.
- **Sincronização**: envio ao backend via WebSocket, com fallback para HTTP REST.

## 🛠️ Tecnologias Utilizadas

- **React Native** com **Expo** (SDK 54)
- **TypeScript** ponta a ponta
- **react-native-maps** para o mapa do campus
- **SQLite** (`expo-sqlite`) para os dados locais
- **Componentes de Sistema**:
  - `expo-location`
  - `expo-sensors`
  - `expo-battery`
  - `expo-constants`
  - `@react-native-community/netinfo`

## 📁 Arquitetura do Projeto

A arquitetura do projeto segue a separação por responsabilidades:
```
src/
├── components/     → Componentes visuais isolados (SensorCard, ActionButton, StatusBadge)
├── constants/      → Constantes do sistema (cores, intervalos, estilo do mapa)
├── database/       → Abstrações e instâncias CRUD do SQLite
├── hooks/          → Hooks de lógica global (sensores, sqlite, coleta, localização, pontos)
├── navigation/     → Alternância entre as telas (Mapa / Sensores)
├── screens/        → Telas principais (MapScreen, DashboardScreen)
├── sensors/        → Isolamento da lógica de listeners de sensores nativos
├── services/       → Comunicação com o backend (api, websocket, pontos)
├── types/          → Interfaces TypeScript e Enums
└── utils/          → Funções auxiliares (matemática, formatação, distância)
```

## 📱 Executando o Projeto

> Suba o backend **antes**. Veja o `SETUP.md` em `TelemetriaSensores_API`.

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor do Expo:
   ```bash
   npm start
   ```

3. Abra o **Expo Go** no seu dispositivo Android e escaneie o QR Code.

4. Conceda a **permissão de localização** quando o app solicitar.

O celular e o computador precisam estar na **mesma rede Wi-Fi**.

## 🔌 Conexão com o backend

O endereço da API é **descoberto automaticamente**: o app usa o IP da máquina que está
rodando o Metro (o mesmo do QR Code), assumindo que o backend roda ali na porta 3000.
Não é preciso editar código ao trocar de computador ou de rede.

Para apontar para outro servidor, crie um `.env` na raiz (veja `.env.example`):

```env
EXPO_PUBLIC_API_HOST=192.168.0.42
EXPO_PUBLIC_API_PORT=3000
```

## 🗺️ Sobre o mapa

O mapa usa o Google Maps através do `react-native-maps`. **No Expo Go funciona sem
configuração**. Para gerar um APK instalável será necessária uma chave do Google Maps
em `app.json` (`android.config.googleMaps.apiKey`) — hoje há um placeholder ali.

As coordenadas dos 10 pontos ainda são **aproximadas**, definidas no seed do backend
(`prisma/seed.ts`), à espera da coleta em campo. Testando fora do campus, os pontos
aparecem distantes e nenhum geofence dispara — comportamento esperado.

---
*Desenvolvido como Trabalho de Conclusão de Curso — Ciência da Computação, Universidade Vila Velha.*
