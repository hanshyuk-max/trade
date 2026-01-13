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

-- 5. 시스템 설정 관리 테이블 (System Configuration)
CREATE TABLE IF NOT EXISTS COM_SYS_CONFIG (
    -- 기본 키 및 시스템 식별
    CONFIG_ID           VARCHAR(50)   PRIMARY KEY,       -- 설정 고유 ID
    SYS_CODE            VARCHAR(20)   NOT NULL,          -- 시스템 구분 (ex: PORTAL, ADMIN, API)
    ENV_TYPE            VARCHAR(10)   NOT NULL,          -- 환경 구분 (DEV, STG, PRD)
    
    -- 설정 핵심 정보
    CONFIG_GROUP        VARCHAR(50)   NOT NULL,          -- 설정 그룹 (ex: AUTH, NETWORK, BATCH)
    CONFIG_KEY          VARCHAR(100)  NOT NULL,          -- 설정 키 (ex: SESSION_TIMEOUT)
    CONFIG_VALUE        TEXT          NOT NULL,          -- 설정 값
    VALUE_TYPE          VARCHAR(10)   DEFAULT 'STRING',  -- 값 타입 (STRING, NUMBER, JSON, BOOL)
    
    -- 다국어 관리 항목 (한국어, 영어)
    CONFIG_NM_KO        VARCHAR(200)  NOT NULL,          -- 설정 명칭(국문)
    CONFIG_NM_EN        VARCHAR(200),                    -- 설정 명칭(영문)
    REMARK_KO           VARCHAR(1000),                   -- 상세 설명(국문)
    REMARK_EN           VARCHAR(1000),                   -- 상세 설명(영문)
    
    -- 보안 및 운영 제어
    ENC_YN              CHAR(1)       DEFAULT 'N',       -- 암호화 여부 (Y, N)
    ENC_KEY_ID          VARCHAR(50),                     -- 암호화 키 ID (필요 시)
    MASK_YN             CHAR(1)       DEFAULT 'N',       -- 마스킹 여부 (Y, N)
    DATA_LEVEL          VARCHAR(10)   DEFAULT 'L2',      -- 보안 등급 (L1, L2, L3)
    APPR_STAT           VARCHAR(10)   DEFAULT 'APPR',    -- 승인 상태 (REQ, APPR, REJ)
    
    -- 기타 관리
    USE_YN              CHAR(1)       DEFAULT 'Y',       -- 사용 여부 (Y, N)
    SORT_ORDR           INTEGER       DEFAULT 0,         -- 정렬 순서
    
    -- 감사 항목 (Audit)
    REG_ID              VARCHAR(20)   NOT NULL,          -- 등록자 ID
    REG_DT              TIMESTAMPTZ   DEFAULT CURRENT_TIMESTAMP, -- 등록 일시
    MOD_ID              VARCHAR(20),                     -- 수정자 ID
    MOD_DT              TIMESTAMPTZ   DEFAULT CURRENT_TIMESTAMP  -- 수정 일시
);

-- 유니크 인덱스: 동일 시스템/환경 내에서 키 중복 방지
-- (Already exists check added manually if needed but IF NOT EXISTS handles table creation, Index typically separate)
-- CREATE UNIQUE INDEX IF NOT EXISTS UIX_COM_SYS_CONFIG_01 ON COM_SYS_CONFIG (SYS_CODE, ENV_TYPE, CONFIG_KEY); 
-- Note: Postgres doesn't support IF NOT EXISTS for INDEX in older versions easily, but 9.5+ does. Assuming modern PG.
CREATE UNIQUE INDEX IF NOT EXISTS UIX_COM_SYS_CONFIG_01 ON COM_SYS_CONFIG (SYS_CODE, ENV_TYPE, CONFIG_KEY);

-- 6. 시스템 설정 이력 테이블 (Configuration History)
CREATE TABLE IF NOT EXISTS COM_SYS_CONFIG_HIST (
    HIST_SEQ            SERIAL        PRIMARY KEY,       -- 이력 순번
    CONFIG_ID           VARCHAR(50)   NOT NULL,          -- 원본 설정 ID
    ACTION_TYPE         CHAR(1)       NOT NULL,          -- 작업 구분 (I: 등록, U: 수정, D: 삭제)
    
    BEFORE_VALUE        TEXT,                            -- 변경 전 값
    AFTER_VALUE         TEXT,                            -- 변경 후 값
    
    CHG_REASON          VARCHAR(500),                    -- 변경 사유
    
    REG_ID              VARCHAR(20)   NOT NULL,          -- 수행자 ID
    REG_DT              TIMESTAMPTZ   DEFAULT CURRENT_TIMESTAMP -- 수행 일시
);

-- 7. Config Update Trigger Function
CREATE OR REPLACE FUNCTION update_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.MOD_DT = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_config_modtime
    BEFORE UPDATE ON COM_SYS_CONFIG
    FOR EACH ROW
    EXECUTE PROCEDURE update_config_timestamp();

-- 8. 메시지 마스터 (Message Master)
CREATE TABLE IF NOT EXISTS COM_MSG_MST (
    MSG_ID       VARCHAR(50)   PRIMARY KEY,
    MSG_KEY      VARCHAR(100)  NOT NULL,
    MSG_TYPE     VARCHAR(10)   NOT NULL, -- LBL, MSG
    MSG_LEVEL    VARCHAR(10),            -- INFO, SUCC, WARN, ERR
    CATEGORY     VARCHAR(20)   NOT NULL, -- 배포될 JSON 파일 그룹명
    ERR_CODE     VARCHAR(20),
    EXPORT_YN    CHAR(1)       DEFAULT 'Y',
    SYNC_STAT    VARCHAR(10)   DEFAULT 'CHANGED', -- SYNCED, CHANGED
    USE_YN       CHAR(1)       DEFAULT 'Y',
    DESCRIPTION  VARCHAR(500),
    REG_ID       VARCHAR(20)   NOT NULL,
    REG_DT       TIMESTAMPTZ   DEFAULT CURRENT_TIMESTAMP,
    MOD_ID       VARCHAR(20),
    MOD_DT       TIMESTAMPTZ   DEFAULT CURRENT_TIMESTAMP
);

-- 유니크 인덱스 (동일 카테고리 내 키 중복 방지)
CREATE UNIQUE INDEX IF NOT EXISTS UIX_COM_MSG_MST_01 ON COM_MSG_MST (CATEGORY, MSG_KEY);

-- 9. 다국어 상세 (Message Language Details)
CREATE TABLE IF NOT EXISTS COM_MSG_LANG (
    MSG_ID       VARCHAR(50)   NOT NULL,
    LANG_CODE    VARCHAR(10)   NOT NULL, -- ko, en
    MSG_TEXT     VARCHAR(4000) NOT NULL,
    PRIMARY KEY (MSG_ID, LANG_CODE),
    FOREIGN KEY (MSG_ID) REFERENCES COM_MSG_MST(MSG_ID) ON DELETE CASCADE
);

-- Update trigger for Message Master
CREATE TRIGGER update_msg_modtime
    BEFORE UPDATE ON COM_MSG_MST
    FOR EACH ROW
    EXECUTE PROCEDURE update_config_timestamp();

-- 10. 사용자 세션 관리 (Concurrent Login Control)
CREATE TABLE IF NOT EXISTS user_sessions (
    session_id      UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         BIGINT        NOT NULL,
    session_token   VARCHAR(255)  NOT NULL UNIQUE, -- JWT or Opaque Token
    device_info     TEXT,                          -- User-Agent or custom device name
    ip_address      VARCHAR(45),
    last_accessed_at TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP,
    created_at      TIMESTAMPTZ   DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(session_token);
