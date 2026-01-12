-- 0. 기존 데이터 초기화 (개발용)
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;

-- 1. 사용자 상태를 정의하는 ENUM 타입 생성 (승인 관련 상태 추가)
-- PENDING: 승인대기, ACTIVE: 정상, REJECTED: 반려, SUSPENDED: 정지, WITHDRAWN: 탈퇴
CREATE TYPE user_status AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED', 'WITHDRAWN');

-- 2. 사용자 테이블 생성
CREATE TABLE users (
    -- 식별 정보
    user_id             BIGSERIAL PRIMARY KEY,
    login_id            VARCHAR(50)  NOT NULL UNIQUE,
    password_hash       VARCHAR(255) NOT NULL,
    email               VARCHAR(100) NOT NULL UNIQUE,
    user_name           VARCHAR(50)  NOT NULL,
    nickname            VARCHAR(50),
    phone_number        VARCHAR(20),
    
    -- 상태 및 권한 (기본값을 PENDING으로 설정)
    status              user_status  DEFAULT 'PENDING',
    user_role           VARCHAR(20)  DEFAULT 'USER', -- ADMIN, MANAGER, USER
    
    -- [추가] 승인 프로세스 관리 항목
    request_date        TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP, -- 가입 신청일
    approved_at         TIMESTAMPTZ,                            -- 승인/반려 처리 일시
    approver_id         BIGINT,                                 -- 승인 처리자 ID
    reject_reason       TEXT,                                   -- 반려 사유
    
    -- 보안 및 마케팅
    failed_login_count  INT          DEFAULT 0,
    marketing_agree     BOOLEAN      DEFAULT FALSE,
    profile_image_url   TEXT,
    
    -- 소셜 로그인 정보
    social_provider     VARCHAR(20),
    social_id           VARCHAR(100),
    
    -- 시스템 공통 시간 정보
    last_login_at       TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP,
    created_at          TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP,
    deleted_at          TIMESTAMPTZ,

    -- 외래키 설정: 승인자는 시스템 내의 다른 사용자(주로 관리자)여야 함
    CONSTRAINT fk_approver FOREIGN KEY (approver_id) REFERENCES users(user_id)
);

-- 3. 검색 성능 향상을 위한 인덱스 설정
CREATE INDEX idx_users_login_id ON users(login_id);
CREATE INDEX idx_users_email ON users(email);
-- 승인 대기자 목록 조회를 위한 부분 인덱스 (성능 최적화)
CREATE INDEX idx_users_status_pending ON users(status) WHERE status = 'PENDING';

-- 4. 업데이트 시 updated_at 자동 갱신을 위한 트리거 함수
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_modtime
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE PROCEDURE update_timestamp_column();
