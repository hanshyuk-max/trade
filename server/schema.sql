-- 1. 사용자 상태를 정의하는 ENUM 타입 생성
DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'WITHDRAWN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. 사용자 테이블 생성
CREATE TABLE IF NOT EXISTS users (
    user_id          BIGSERIAL PRIMARY KEY,
    login_id         VARCHAR(50)  NOT NULL UNIQUE,
    password_hash    VARCHAR(255) NOT NULL,
    email            VARCHAR(100) NOT NULL UNIQUE,
    user_name        VARCHAR(50)  NOT NULL,
    nickname         VARCHAR(50),
    phone_number     VARCHAR(20),
    status           user_status  DEFAULT 'ACTIVE',
    user_role        VARCHAR(20)  DEFAULT 'USER',
    failed_login_count INT        DEFAULT 0,
    marketing_agree    BOOLEAN    DEFAULT FALSE,
    profile_image_url  TEXT,
    social_provider    VARCHAR(20),
    social_id          VARCHAR(100),
    last_login_at      TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at         TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at         TIMESTAMPTZ
);

-- 3. 검색 성능 향상을 위한 인덱스 설정
CREATE INDEX IF NOT EXISTS idx_users_login_id ON users(login_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- 4. 업데이트 시 updated_at 자동 갱신을 위한 트리거 함수
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_modtime ON users;
CREATE TRIGGER update_user_modtime
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE PROCEDURE update_timestamp_column();
