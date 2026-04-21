# API Endpoints - Casino Platform

## 📋 Índice

- [Auth](#auth)
- [Wallet](#wallet)
- [Games](#games)
- [Admin](#admin)
- [WebSocket Events](#websocket-events)

---

## 🔐 Auth

### POST `/api/auth/register`
Registrar novo usuário.

**Body:**
```json
{
  "username": "player123",
  "email": "player@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:** `201 Created`
```json
{
  "user": { "id": "uuid", "username": "player123", "email": "player@example.com" },
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

### POST `/api/auth/login`
Autenticar usuário.

**Body:**
```json
{
  "username": "player123",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "user": { "id": "uuid", "username": "player123", "email": "player@example.com" },
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

### POST `/api/auth/refresh`
Renovar token de acesso.

**Body:**
```json
{
  "refreshToken": "eyJhbG..."
}
```

### POST `/api/auth/logout`
Encerrar sessão. Requer autenticação.

### POST `/api/auth/forgot-password`
Solicitar recuperação de senha.

**Body:**
```json
{
  "email": "player@example.com"
}
```

### POST `/api/auth/reset-password`
Redefinir senha com token.

**Body:**
```json
{
  "token": "reset-token",
  "newPassword": "newSecurePassword123"
}
```

### GET `/api/auth/me`
Obter perfil do usuário autenticado.

**Headers:** `Authorization: Bearer <token>`

---

## 💰 Wallet

### GET `/api/wallet/balance`
Obter saldo da carteira.

**Query Params:** `?currency=BRL`

**Response:**
```json
{
  "balance": 1500.50,
  "currency": "BRL"
}
```

### POST `/api/wallet/deposit`
Realizar depósito.

**Body:**
```json
{
  "amount": 100.00,
  "paymentMethod": "pix",
  "transactionRef": "PIX123456"
}
```

### POST `/api/wallet/withdraw`
Solicitar saque.

**Body:**
```json
{
  "amount": 500.00,
  "withdrawalMethod": "bank_transfer",
  "accountDetails": "Agência: 1234, Conta: 56789-0",
  "idempotencyKey": "unique-key-12345"
}
```

### POST `/api/wallet/transfer`
Transferir para outro usuário.

**Body:**
```json
{
  "toUserId": "user-uuid",
  "amount": 50.00,
  "idempotencyKey": "unique-key-67890",
  "reason": "Payment for game"
}
```

### GET `/api/wallet/transactions`
Histórico de transações.

**Query Params:** `?type=deposit&limit=20&offset=0`

### GET `/api/wallet/transactions/:id`
Detalhes de uma transação.

---

## 🎮 Games

### POST `/api/games/bet`
Realizar aposta.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "gameId": "slots",
  "amount": 10.00,
  "betType": "line_1",
  "betData": "{\"lines\": 5}",
  "idempotencyKey": "unique-bet-key-123"
}
```

**Response:**
```json
{
  "session": { "id": "session-uuid", "balance": 150.00, "status": "active" },
  "bet": {
    "id": "bet-uuid",
    "amount": 10.00,
    "status": "won",
    "payout": 50.00,
    "result": "{\"symbols\": [\"7\", \"7\", \"7\"]}"
  }
}
```

### POST `/api/games/cashout`
Encerrar sessão e sacar ganhos.

**Body:**
```json
{
  "sessionId": "session-uuid",
  "idempotencyKey": "unique-cashout-key"
}
```

### GET `/api/games/sessions/:sessionId`
Obter detalhes da sessão.

### GET `/api/games/history`
Histórico de apostas.

**Query Params:** `?gameId=slots&limit=20&offset=0`

### GET `/api/games/available`
Listar jogos disponíveis.

### GET `/api/games/:gameId/rules`
Obter regras de um jogo específico.

---

## 👨‍💼 Admin

Todos os endpoints admin requerem role `admin` ou `superadmin`.

### GET `/api/admin/dashboard`
Estatísticas do dashboard.

**Response:**
```json
{
  "users": { "total": 1500, "active": 1200 },
  "transactions": { "total": 5000 },
  "bets": { "total": 25000 },
  "revenue": { "total": 150000.00 },
  "recentActivities": []
}
```

### GET `/api/admin/users`
Listar usuários.

**Query Params:** `?page=1&limit=20&status=active`

### GET `/api/admin/users/:id`
Detalhes de um usuário.

### POST `/api/admin/users/:id/activate`
Ativar usuário.

### POST `/api/admin/users/:id/suspend`
Suspender usuário.

**Body:**
```json
{
  "reason": "Violation of terms"
}
```

### GET `/api/admin/transactions`
Todas as transações.

**Query Params:** `?type=deposit&status=completed&limit=50`

### GET `/api/admin/bets`
Todas as apostas.

**Query Params:** `?gameId=slots&status=won&limit=50`

### GET `/api/admin/games`
Listar todos os jogos.

### POST `/api/admin/games/:id/toggle`
Ativar/desativar jogo.

### GET `/api/admin/audit-logs`
Logs de auditoria.

**Query Params:** `?entityType=user&entityId=uuid&limit=50`

### GET `/api/admin/reports/daily`
Relatório diário.

**Query Params:** `?date=2024-01-15`

### GET `/api/admin/reports/revenue`
Relatório de receita.

**Query Params:** `?startDate=2024-01-01&endDate=2024-01-31`

---

## 🔌 WebSocket Events

Conectar em: `ws://localhost:3000/games`

### Client → Server

#### `authenticate`
Autenticar conexão WebSocket.

```json
{
  "token": "eyJhbG..."
}
```

#### `join_game`
Entrar em sala de jogo.

```json
{
  "gameId": "slots"
}
```

#### `leave_game`
Sair da sala de jogo.

```json
{
  "gameId": "slots"
}
```

#### `place_bet`
Realizar aposta via WebSocket.

```json
{
  "gameId": "slots",
  "betData": { "lines": 5, "betPerLine": 2 }
}
```

#### `game_action`
Executar ação no jogo.

```json
{
  "gameId": "blackjack",
  "action": "hit",
  "payload": {}
}
```

#### `admin_broadcast` (apenas admin)
Enviar mensagem para jogadores.

```json
{
  "message": "Maintenance in 5 minutes",
  "gameId": "slots"
}
```

### Server → Client

#### `authenticated`
Confirmação de autenticação.

```json
{
  "event": "authenticated",
  "data": { "success": true, "userId": "uuid" }
}
```

#### `joined_game`
Confirmado entrada na sala.

```json
{
  "event": "joined_game",
  "data": { "gameId": "slots", "players": ["player1", "player2"] }
}
```

#### `player_joined`
Outro jogador entrou na sala.

#### `player_left`
Outro jogador saiu da sala.

#### `bet_placed`
Aposta realizada por jogador.

```json
{
  "event": "bet_placed",
  "data": {
    "gameId": "slots",
    "username": "player1",
    "betData": {},
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

#### `game_result`
Resultado do jogo.

```json
{
  "event": "game_result",
  "data": {
    "gameId": "slots",
    "win": true,
    "payout": 50.00,
    "result": {}
  }
}
```

#### `balance_update`
Atualização de saldo.

```json
{
  "event": "balance_update",
  "data": {
    "balance": 1550.00,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

#### `game_state`
Estado atualizado do jogo.

#### `admin_message`
Mensagem de administrador.

---

## 🔑 Headers Obrigatórios

Para endpoints autenticados:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

## ⚠️ Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Token ausente ou inválido |
| 403 | Forbidden - Permissão insuficiente |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Conflito (ex: idempotência) |
| 422 | Unprocessable Entity - Validação falhou |
| 500 | Internal Server Error |

## 🔄 Idempotência

Operações financeiras exigem `idempotencyKey` único (min. 10 caracteres).
Requisições duplicadas com a mesma chave retornam o resultado original.
