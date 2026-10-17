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

### Coleta em Realidade Aumentada (ARCore)
- **Câmera liberada no raio**: dentro do geofence de um ponto aparece o botão *Abrir câmera AR*.
- **Objeto 3D no mundo real**: o ARCore (via [ViroReact](https://github.com/ReactVision/viro))
  detecta o chão e posiciona o modelo 3D do ponto (`Objeto3D` da API, em GLB). Sem superfície
  detectada em ~8 s, o objeto aparece flutuando à frente da câmera.
- **Toque para coletar**: só ao tocar no objeto o check-in é enviado (`POST /api/interacoes`).
  O backend revalida o geofence, credita os pontos uma única vez e devolve as conquistas
  desbloqueadas.
- **Pontos coletados**: o marcador fica dourado e a câmera não é mais oferecida naquele ponto.

### Conta de usuário
- **Login e registro** (e-mail e senha) validados pelo backend (`/api/auth/*`).
- A sessão fica salva no SQLite: o app abre já logado, mesmo sem internet.

### Telemetria
- **Início automático**: a coleta começa assim que o app abre (inclusive na tela de
  login) e funciona offline. A aba *Sensores* permite pausar/retomar.
- **Tabela `telemetria_sensor`**: mesmas colunas da classe `TelemetriaSensor` do
  diagrama (`latitude`, `longitude`, `acelerometro_x/y/z`, `magnitude`,
  `nivel_bateria`, `tipo_rede`, `timestamp`) + `usuario_id` e `synced`. Leituras sem
  GPS não são gravadas. A tabela antiga `sensor_logs` é migrada automaticamente.
- **Captura de GPS**: latitude, longitude, precisão e timestamp (a cada 30 segundos).
- **Acelerômetro**: eixos X, Y, Z e cálculo da magnitude (a cada 1000ms).
- **Bateria**: nível de carga e status de carregamento.
- **Conectividade**: estado da rede (Wi-Fi, dados móveis ou offline).
- **Armazenamento offline**: persistência local em SQLite (`expo-sqlite`), gravando em
  lotes a cada 30 segundos para preservar bateria.
- **Sincronização**: envio ao backend via WebSocket, com fallback para HTTP REST.
  Com usuário logado, o token vai junto e os registros ficam associados a ele.

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
├── screens/        → Telas principais (MapScreen, ARColetaScreen, DashboardScreen)
├── sensors/        → Isolamento da lógica de listeners de sensores nativos
├── services/       → Comunicação com o backend (api, websocket, pontos, interacoes)
├── types/          → Interfaces TypeScript e Enums
└── utils/          → Funções auxiliares (matemática, formatação, distância)
```

## 📱 Executando o Projeto

> Suba o backend **antes**. Veja o `SETUP.md` em `TelemetriaSensores_API`.

1. Instale as dependências:
   ```bash
   npm install
   ```

2. **Na primeira vez**, com o celular conectado por USB (depuração USB ativada), compile e
   instale o app — exige o Android Studio instalado:
   ```bash
   npm run android
   ```
   > O app usa ARCore (código nativo), por isso **não roda no Expo Go**: é um
   > *development build* (`expo-dev-client`). Só é preciso recompilar ao mudar uma
   > dependência nativa ou o `app.json`.

3. No dia a dia, inicie o Metro e abra o app **UVV Go** no celular:
   ```bash
   npm start
   ```

4. Conceda a **permissão de localização** quando o app solicitar (a de câmera é pedida
   na primeira coleta em AR).

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

O mapa usa o Google Maps através do `react-native-maps`. Como o app não roda mais no
Expo Go, é **obrigatório** ter uma chave do Google Maps (Maps SDK for Android) em
`app.json` (`android.config.googleMaps.apiKey`) — sem ela o mapa abre cinza. Hoje há um
placeholder ali; veja o passo 3.2 do `SETUP.md`.

As coordenadas dos 10 pontos ainda são **aproximadas**, definidas no seed do backend
(`prisma/seed.ts`), à espera da coleta em campo. Testando fora do campus, os pontos
aparecem distantes e nenhum geofence dispara — comportamento esperado.

---
*Desenvolvido como Trabalho de Conclusão de Curso — Ciência da Computação, Universidade Vila Velha.*
