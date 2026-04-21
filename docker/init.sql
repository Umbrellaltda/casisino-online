-- Casino Platform - Database Initialization Script
-- PostgreSQL 15+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_status AS ENUM ('pending', 'active', 'suspended', 'banned');
CREATE TYPE kyc_status AS ENUM ('not_submitted', 'pending', 'approved', 'rejected');
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'bet', 'win', 'bonus', 'refund', 'adjustment');
CREATE TYPE transaction_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');
CREATE TYPE bet_status AS ENUM ('pending', 'settled', 'cancelled', 'void');
CREATE TYPE game_type AS ENUM ('slot', 'blackjack', 'roulette', 'poker', 'other');
CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete', 'login', 'logout', 'bet_placed', 'bet_settled', 'transaction_created', 'transaction_completed');

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    phone VARCHAR(20),
    country VARCHAR(2),
    status user_status DEFAULT 'pending',
    kyc_status kyc_status DEFAULT 'not_submitted',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- User roles and permissions
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (user_id, role_id)
);

-- Default roles
INSERT INTO roles (name, description, permissions) VALUES
('admin', 'Administrator with full access', '["*"]'::jsonb),
('operator', 'Casino operator with limited access', '["users:read", "games:read", "reports:read"]'::jsonb),
('support', 'Customer support agent', '["users:read", "transactions:read"]'::jsonb),
('user', 'Regular player', '["profile:read", "profile:update", "wallet:read", "games:play"]'::jsonb);

-- ============================================
-- KYC (Know Your Customer)
-- ============================================

CREATE TABLE kyc_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- passport, id_card, drivers_license, proof_of_address
    document_number VARCHAR(100),
    issuing_country VARCHAR(2),
    expiry_date DATE,
    front_image_url VARCHAR(500),
    back_image_url VARCHAR(500),
    selfie_image_url VARCHAR(500),
    status kyc_status DEFAULT 'pending',
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kyc_documents_user_id ON kyc_documents(user_id);
CREATE INDEX idx_kyc_documents_status ON kyc_documents(status);

-- ============================================
-- WALLETS & TRANSACTIONS (CQRS Read Models)
-- ============================================

CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    balance DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    bonus_balance DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    locked_balance DECIMAL(18, 2) NOT NULL DEFAULT 0.00, -- Balance locked in active bets
    total_deposited DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    total_withdrawn DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    total_won DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    total_lost DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    version INTEGER NOT NULL DEFAULT 0, -- Optimistic locking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_currency UNIQUE (user_id, currency),
    CONSTRAINT check_balances CHECK (balance >= 0 AND bonus_balance >= 0 AND locked_balance >= 0)
);

CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_currency ON wallets(currency);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallets(id),
    user_id UUID NOT NULL REFERENCES users(id),
    type transaction_type NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status transaction_status DEFAULT 'pending',
    reference_id VARCHAR(255), -- External payment gateway reference
    idempotency_key VARCHAR(255) UNIQUE, -- For idempotent operations
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    processed_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_idempotency ON transactions(idempotency_key);

-- Transaction events (for CQRS event sourcing)
CREATE TABLE transaction_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transaction_events_transaction_id ON transaction_events(transaction_id);
CREATE INDEX idx_transaction_events_occurred_at ON transaction_events(occurred_at);

-- ============================================
-- BETS & GAMES
-- ============================================

CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    type game_type NOT NULL,
    provider VARCHAR(100),
    min_bet DECIMAL(18, 2) NOT NULL DEFAULT 0.01,
    max_bet DECIMAL(18, 2) NOT NULL DEFAULT 1000.00,
    rtp DECIMAL(5, 2), -- Return to Player percentage
    is_active BOOLEAN DEFAULT TRUE,
    configuration JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_games_type ON games(type);
CREATE INDEX idx_games_active ON games(is_active);

CREATE TABLE bets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    wallet_id UUID NOT NULL REFERENCES wallets(id),
    game_id UUID NOT NULL REFERENCES games(id),
    amount DECIMAL(18, 2) NOT NULL,
    potential_win DECIMAL(18, 2),
    actual_win DECIMAL(18, 2) DEFAULT 0.00,
    status bet_status DEFAULT 'pending',
    idempotency_key VARCHAR(255) UNIQUE, -- Prevent duplicate bets
    round_id VARCHAR(255), -- Game round identifier
    bet_data JSONB NOT NULL, -- Game-specific bet details
    result_data JSONB, -- Game result
    settled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bets_user_id ON bets(user_id);
CREATE INDEX idx_bets_wallet_id ON bets(wallet_id);
CREATE INDEX idx_bets_game_id ON bets(game_id);
CREATE INDEX idx_bets_status ON bets(status);
CREATE INDEX idx_bets_created_at ON bets(created_at);
CREATE INDEX idx_bets_idempotency ON bets(idempotency_key);

-- Game sessions
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    game_id UUID NOT NULL REFERENCES games(id),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    starting_balance DECIMAL(18, 2),
    ending_balance DECIMAL(18, 2),
    total_bets INTEGER DEFAULT 0,
    total_won DECIMAL(18, 2) DEFAULT 0.00,
    total_lost DECIMAL(18, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'active', -- active, completed, abandoned
    ip_address INET,
    user_agent TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_token ON game_sessions(session_token);

-- ============================================
-- AUDIT LOGS (Immutable)
-- ============================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action audit_action NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- user, wallet, transaction, bet, game
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_occurred_at ON audit_logs(occurred_at);

-- Make audit_logs append-only (no updates or deletes)
-- This is enforced at application level, but we add a trigger as extra protection
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        RAISE EXCEPTION 'Audit logs cannot be modified';
    ELSIF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'Audit logs cannot be deleted';
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_log_immutable
    BEFORE UPDATE OR DELETE ON audit_logs
    FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();

-- ============================================
-- SYSTEM & CONFIGURATION
-- ============================================

CREATE TABLE system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Default settings
INSERT INTO system_settings (key, value, description) VALUES
('maintenance_mode', 'false', 'System maintenance mode'),
('registration_enabled', 'true', 'Allow new user registrations'),
('min_deposit_amount', '{"USD": 10, "EUR": 10, "BRL": 50}', 'Minimum deposit amounts by currency'),
('max_withdrawal_daily', '{"USD": 10000, "EUR": 10000, "BRL": 50000}', 'Maximum daily withdrawal limits'),
('kyc_required_threshold', '{"USD": 2000}', 'KYC required for withdrawals above this amount'),
('session_timeout_minutes', '30', 'User session timeout in minutes'),
('max_concurrent_sessions', '3', 'Maximum concurrent game sessions per user');

-- Rate limiting tracking
CREATE TABLE rate_limits (
    identifier VARCHAR(255) NOT NULL, -- IP, user_id, etc.
    endpoint VARCHAR(255) NOT NULL,
    count INTEGER NOT NULL DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY (identifier, endpoint, window_start)
);

CREATE INDEX idx_rate_limits_window ON rate_limits(window_start);

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

-- Daily statistics view
CREATE VIEW daily_statistics AS
SELECT 
    DATE_TRUNC('day', created_at) AS date,
    COUNT(DISTINCT user_id) AS active_users,
    COUNT(*) AS total_bets,
    SUM(amount) AS total_bet_amount,
    SUM(actual_win) AS total_payout,
    SUM(amount) - SUM(actual_win) AS gross_gaming_revenue
FROM bets
WHERE status = 'settled'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- User activity summary view
CREATE VIEW user_activity_summary AS
SELECT 
    u.id AS user_id,
    u.username,
    u.email,
    u.status,
    w.balance,
    w.total_deposited,
    w.total_withdrawn,
    w.total_won,
    w.total_lost,
    COUNT(DISTINCT b.id) AS total_bets,
    MAX(b.created_at) AS last_bet_at,
    MAX(gs.started_at) AS last_session_at
FROM users u
LEFT JOIN wallets w ON u.id = w.user_id
LEFT JOIN bets b ON u.id = b.user_id
LEFT JOIN game_sessions gs ON u.id = gs.user_id
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.username, u.email, u.status, w.balance, w.total_deposited, w.total_withdrawn, w.total_won, w.total_lost;

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bets_updated_at BEFORE UPDATE ON bets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kyc_documents_updated_at BEFORE UPDATE ON kyc_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default games
INSERT INTO games (name, type, min_bet, max_bet, rtp, configuration) VALUES
('Lucky Slots', 'slot', 0.10, 100.00, 96.50, '{"reels": 5, "rows": 3, "paylines": 20}'),
('Classic Blackjack', 'blackjack', 1.00, 500.00, 99.50, '{"decks": 6, "dealer_hits_soft_17": true}'),
('European Roulette', 'roulette', 0.50, 1000.00, 97.30, '{"zero_count": 1, "en_prison": false}');
