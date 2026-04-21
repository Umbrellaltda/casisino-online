# Casino Platform - Arquitetura Base

Plataforma de jogos digitais com arquitetura em camadas, seguindo melhores práticas para sistemas de alta concorrência e transações financeiras.

## 🏗️ Arquitetura

```
/src
  /games          # Engines de jogos (Slot, Blackjack, Roulette)
  /wallet         # Sistema de carteira/saldo (CQRS)
  /auth           # Autenticação, autorização e KYC
  /admin          # Painel administrativo
  /shared         # Utilitários, tipos, constantes, middleware
```

### Camadas

1. **Presentation Layer**: Controllers NestJS + WebSocket (Socket.io)
2. **Business Layer**: Services, Game Engines, CQRS Handlers
3. **Data Layer**: TypeORM (PostgreSQL), Redis, Message Queue

## 🚀 Stack Tecnológica

- **Backend**: Node.js + NestJS
- **Frontend**: React 18 + TypeScript + PixiJS
- **Database**: PostgreSQL (dados relacionais) + Redis (sessão/cache)
- **Message Queue**: RabbitMQ / Apache Kafka
- **WebSocket**: Socket.io (tempo real)

## 📋 Funcionalidades Implementadas

### Jogos
- ✅ Slot Machine (5 rolos, 3 linhas, 20 paylines)
- ✅ Blackjack (6 baralhos, dealer stand on 17)
- ✅ Roleta Europeia (single zero, múltiplos tipos de aposta)

### Wallet & Transações
- ✅ Padrão CQRS para operações financeiras
- ✅ Idempotência em todas as operações de aposta
- ✅ Logs de auditoria imutáveis
- ✅ Optimistic locking para concorrência

### Segurança
- ✅ Autenticação JWT
- ✅ Guards para autorização por roles
- ✅ Validação KYC obrigatória para apostas
- ✅ Rate limiting pronto para implementação

## 🔧 Instalação

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env

# Iniciar banco de dados (Docker)
docker-compose up -d postgres redis rabbitmq

# Rodar migrações
npm run migration:run

# Iniciar em desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

## 📁 Estrutura de Pastas

```
src/
├── games/
│   ├── base-game.ts        # Classe abstrata base para jogos
│   ├── types.ts            # Tipos compartilhados de jogos
│   ├── slot/
│   │   └── slot.game.ts    # Implementação Slot Machine
│   ├── blackjack/
│   │   └── blackjack.game.ts # Implementação Blackjack
│   └── roulette/
│       └── roulette.game.ts  # Implementação Roleta
├── wallet/
│   ├── commands/           # CQRS Commands
│   ├── queries/            # CQRS Queries
│   ├── audit/
│   │   └── entities.ts     # Entidades: Wallet, Transaction, Bet, AuditLog
│   └── wallet.module.ts
├── auth/
│   ├── guards/             # Auth guards (JWT, KYC, Roles)
│   ├── strategies/         # Passport strategies
│   ├── kyc/                # Lógica KYC
│   └── auth.module.ts
├── admin/
│   ├── controllers/
│   └── services/
├── shared/
│   ├── types/              # Tipos TypeScript globais
│   ├── constants/          # Constantes da plataforma
│   ├── utils/              # Funções utilitárias
│   ├── dto/                # Data Transfer Objects
│   ├── middleware/         # Middleware (idempotência, logging)
│   ├── decorators/         # Decorators customizados
│   └── guards/             # Guards compartilhados
├── app.module.ts           # Módulo principal
└── main.ts                 # Entry point
```

## 🔐 Idempotência

Todas as operações de aposta utilizam chaves de idempotência para prevenir processamento duplicado:

```typescript
// Header requerido em requisições de aposta
X-Idempotency-Key: <uuid>

// O middleware verifica no Redis se a chave já foi processada
// Se sim, retorna resposta cached sem reprocessar
```

## 📊 Auditoria

Todos os logs de transações são:
- **Imutáveis**: Uma vez criados, não podem ser alterados
- **Criptografados**: Dados sensíveis são encriptados
- **Rastreáveis**: Cada transação tem correlationId único
- **Retidos**: 7 anos conforme regulamentação

## ⚠️ Importante

Esta é uma **arquitetura base** para fins educacionais e de demonstração. Para uso em produção:

1. Consulte advogados sobre regulamentação de jogos na sua jurisdição
2. Implemente provedor RNG certificado (e.g., GLI, iTech Labs)
3. Adicione integração com gateways de pagamento reais
4. Implemente sistemas de responsible gaming (auto-exclusão, limites)
5. Contrate auditoria de segurança especializada

## 📄 Licença

MIT