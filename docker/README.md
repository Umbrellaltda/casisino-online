# PostgreSQL & Redis Configuration Guide

## 📋 Visão Geral

Este guia descreve como configurar e utilizar PostgreSQL e Redis na plataforma de casino.

## 🚀 Inicialização Rápida

### 1. Iniciar Infraestrutura com Docker

```bash
# Navegue até a pasta docker
cd docker

# Inicie todos os serviços
docker-compose up -d

# Ou use o script de setup
cd ../scripts
./setup.sh start
```

### 2. Verificar Status dos Serviços

```bash
# Verificar status
docker-compose ps

# Ou via script
./setup.sh status
```

### 3. Acessar Serviços

#### PostgreSQL
- **Host:** localhost
- **Porta:** 5432
- **Database:** casino_platform
- **User:** postgres
- **Password:** postgres

```bash
# Conectar via psql
docker-compose exec postgres psql -U postgres -d casino_platform

# Ou via script
./setup.sh db-shell
```

#### Redis
- **Host:** localhost
- **Porta:** 6379
- **Password:** (nenhuma em desenvolvimento)

```bash
# Conectar via redis-cli
docker-compose exec redis redis-cli

# Ou via script
./setup.sh redis-cli
```

#### RabbitMQ Management UI
- **URL:** http://localhost:15672
- **User:** guest
- **Password:** guest

## 📊 Schema do Banco de Dados

O script `init.sql` cria automaticamente:

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `users` | Usuários e autenticação |
| `roles` | Roles e permissões |
| `user_roles` | Associação usuário-role |
| `kyc_documents` | Documentos KYC |
| `wallets` | Carteiras de usuários |
| `transactions` | Transações financeiras |
| `transaction_events` | Eventos CQRS de transações |
| `games` | Configuração de jogos |
| `bets` | Apostas realizadas |
| `game_sessions` | Sessões de jogo |
| `audit_logs` | Logs de auditoria imutáveis |
| `system_settings` | Configurações do sistema |
| `rate_limits` | Rate limiting |

### Views de Reporting

- `daily_statistics` - Estatísticas diárias de apostas
- `user_activity_summary` - Resumo de atividade por usuário

### Triggers e Funções

- `update_updated_at_column()` - Atualiza timestamp automaticamente
- `prevent_audit_log_modification()` - Previne modificação de audit logs

## 🔧 Configuração no Backend

### Variáveis de Ambiente

Copie `.env.example` para `.env`:

```bash
cp .env.example .env
```

Configure as variáveis:

```env
# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=casino_platform

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Message Queue (RabbitMQ)
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

### Módulo Database (NestJS)

O módulo `src/database/database.module.ts` configura:

- TypeORM com PostgreSQL
- Redis com ioredis
- ConfigModule para variáveis de ambiente

## 📝 Comandos Úteis

### PostgreSQL

```sql
-- Listar todas as tabelas
\dt

-- Descrever tabela
\d users

-- Ver estatísticas diárias
SELECT * FROM daily_statistics LIMIT 10;

-- Ver resumo de usuários
SELECT * FROM user_activity_summary LIMIT 10;

-- Contar registros
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM wallets) as wallets,
  (SELECT COUNT(*) FROM transactions) as transactions,
  (SELECT COUNT(*) FROM bets) as bets,
  (SELECT COUNT(*) FROM audit_logs) as audit_logs;
```

### Redis

```bash
# Conectar
redis-cli

# Testar conexão
PING

# Ver chaves
KEYS *

# Ver info do servidor
INFO

# Monitorar comandos em tempo real
MONITOR

# Limpar dados (cuidado!)
FLUSHALL
```

### Docker Compose

```bash
# Parar serviços
docker-compose down

# Parar e remover volumes (limpa dados)
docker-compose down -v

# Ver logs
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f rabbitmq

# Reiniciar um serviço específico
docker-compose restart postgres

# Reconstruir containers
docker-compose up -d --build
```

## 🔒 Segurança em Produção

### PostgreSQL

```env
# Use senhas fortes
DB_PASSWORD=sua-senha-forte-aqui

# Restrinja acesso por IP
# Configure pg_hba.conf

# Use SSL
DB_SSL=true
```

### Redis

```env
# Sempre use senha em produção
REDIS_PASSWORD=sua-senha-forte-aqui

# Use requirepass no redis.conf
# Bind apenas a interfaces internas
```

## 📈 Monitoring

### Health Checks

Os serviços incluem health checks automáticos:

- **PostgreSQL:** `pg_isready` a cada 10s
- **Redis:** `redis-cli ping` a cada 10s
- **RabbitMQ:** `rabbitmq-diagnostics ping` a cada 30s

### Logs de Auditoria

Todas as operações críticas são registradas em `audit_logs`:

```sql
-- Últimas ações de um usuário
SELECT action, entity_type, entity_id, occurred_at, metadata
FROM audit_logs
WHERE user_id = 'uuid-do-usuario'
ORDER BY occurred_at DESC
LIMIT 50;

-- Ações por tipo
SELECT action, COUNT(*) as count
FROM audit_logs
GROUP BY action
ORDER BY count DESC;
```

## 🐛 Troubleshooting

### PostgreSQL não inicia

```bash
# Ver logs
docker-compose logs postgres

# Verificar se porta está em uso
lsof -i :5432

# Remover volume e reiniciar (PERDE DADOS!)
docker-compose down -v
docker-compose up -d
```

### Redis não conecta

```bash
# Verificar se está rodando
docker-compose ps redis

# Testar conexão
docker-compose exec redis redis-cli ping

# Ver logs
docker-compose logs redis
```

### Erro de conexão no backend

1. Verifique se os serviços estão rodando
2. Confirme as variáveis de ambiente
3. Teste conexão manualmente:
   ```bash
   psql -h localhost -U postgres -d casino_platform
   redis-cli ping
   ```

## 📚 Recursos Adicionais

- [Documentação PostgreSQL](https://www.postgresql.org/docs/)
- [Documentação Redis](https://redis.io/documentation)
- [TypeORM Documentation](https://typeorm.io/)
- [NestJS TypeORM](https://docs.nestjs.com/techniques/database)

---

**Próximos Passos:**
1. ✅ Infraestrutura configurada
2. ⏭️ Executar `npm install`
3. ⏭️ Configurar `.env`
4. ⏭️ Rodar migrações (se necessário)
5. ⏭️ Iniciar aplicação: `npm run dev`
