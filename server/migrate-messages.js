const db = require('./db');

const SEED_DATA = [
    // AUTH / LOGIN
    { key: 'LOGIN_TITLE', type: 'LBL', cat: 'AUTH', en: 'Welcome Back', ko: '환영합니다' },
    { key: 'LOGIN_SUBTITLE', type: 'LBL', cat: 'AUTH', en: 'Sign in to manage your portfolio', ko: '포트폴리오 관리를 위해 로그인하세요' },
    { key: 'LOGIN_USERNAME', type: 'LBL', cat: 'AUTH', en: 'Username', ko: '아이디' },
    { key: 'LOGIN_PASSWORD', type: 'LBL', cat: 'AUTH', en: 'Password', ko: '비밀번호' },
    { key: 'LOGIN_BTN', type: 'LBL', cat: 'AUTH', en: 'Sign In', ko: '로그인' },
    { key: 'LOGIN_FOOTER_TEXT', type: 'LBL', cat: 'AUTH', en: "Don't have an account?", ko: '계정이 없으신가요?' },
    { key: 'LOGIN_CREATE_ACCOUNT', type: 'LBL', cat: 'AUTH', en: 'Create an Account', ko: '계정 만들기' },
    { key: 'LOGIN_INVALID_CREDENTIALS', type: 'MSG', cat: 'AUTH', en: 'Invalid credentials. Try admin / 1234', ko: '잘못된 정보입니다. (admin / 1234)' },

    // REGISTER
    { key: 'REG_TITLE', type: 'LBL', cat: 'AUTH', en: 'Create Account', ko: '계정 생성' },
    { key: 'REG_SUBTITLE', type: 'LBL', cat: 'AUTH', en: 'Join TradeOS platform', ko: 'TradeOS 플랫폼에 가입하세요' },
    { key: 'REG_FULLNAME', type: 'LBL', cat: 'AUTH', en: 'Full Name', ko: '이름' },
    { key: 'REG_EMAIL', type: 'LBL', cat: 'AUTH', en: 'Email Address', ko: '이메일 주소' },
    { key: 'REG_PHONE', type: 'LBL', cat: 'AUTH', en: 'Phone Number (Optional)', ko: '전화번호 (선택)' },
    { key: 'REG_BTN', type: 'LBL', cat: 'AUTH', en: 'Create Account', ko: '계정 만들기' },
    { key: 'REG_SUCCESS_TITLE', type: 'MSG', cat: 'AUTH', en: 'Registration Successful', ko: '가입완료' },

    // SIDEBAR
    { key: 'MENU_TITLE', type: 'LBL', cat: 'COMMON', en: 'Menu', ko: '메뉴' },
    { key: 'MENU_DASHBOARD', type: 'LBL', cat: 'COMMON', en: 'Dashboard', ko: '대시보드' },
    { key: 'MENU_TRADE', type: 'LBL', cat: 'COMMON', en: 'Trade', ko: '거래' },
    { key: 'MENU_HISTORY', type: 'LBL', cat: 'COMMON', en: 'History', ko: '내역' },
    { key: 'MENU_CAPITAL', type: 'LBL', cat: 'COMMON', en: 'Capital', ko: '자산' },
    { key: 'MENU_USERS', type: 'LBL', cat: 'COMMON', en: 'Users', ko: '사용자 관리' },
    { key: 'MENU_SYSCONFIG', type: 'LBL', cat: 'COMMON', en: 'SysConfig', ko: '시스템 설정' },
    { key: 'MENU_MESSAGES', type: 'LBL', cat: 'COMMON', en: 'Messages', ko: '다국어 관리' },
    { key: 'MENU_SIGNOUT', type: 'LBL', cat: 'COMMON', en: 'Sign Out', ko: '로그아웃' },

    // DASHBOARD
    { key: 'DASH_TITLE', type: 'LBL', cat: 'DASHBOARD', en: 'Dashboard', ko: '대시보드' },
    { key: 'DASH_SUBTITLE', type: 'LBL', cat: 'DASHBOARD', en: 'Overview of your portfolio performance', ko: '포트폴리오 성과 현황' },
    { key: 'DASH_TOTAL_CAPITAL', type: 'LBL', cat: 'DASHBOARD', en: 'Total Capital', ko: '총 자산' },
    { key: 'DASH_INVESTED', type: 'LBL', cat: 'DASHBOARD', en: 'Invested', ko: '투자금액' },
    { key: 'DASH_CASH_BALANCE', type: 'LBL', cat: 'DASHBOARD', en: 'Cash Balance', ko: '보유 현금' },
    { key: 'DASH_PORTFOLIO_COMP', type: 'LBL', cat: 'DASHBOARD', en: 'Portfolio composition', ko: '포트폴리오 구성' },
    { key: 'DASH_RECENT_ACTIVITY', type: 'LBL', cat: 'DASHBOARD', en: 'Recent Activity', ko: '최근 활동' },

    // COMMON
    { key: 'BTN_SAVE', type: 'LBL', cat: 'COMMON', en: 'Save', ko: '저장' },
    { key: 'BTN_CANCEL', type: 'LBL', cat: 'COMMON', en: 'Cancel', ko: '취소' },
    { key: 'BTN_DELETE', type: 'LBL', cat: 'COMMON', en: 'Delete', ko: '삭제' },
    { key: 'BTN_ADD', type: 'LBL', cat: 'COMMON', en: 'Add', ko: '추가' },
    { key: 'BTN_DEPLOY', type: 'LBL', cat: 'COMMON', en: 'Deploy', ko: '배포' },
];

async function migrate() {
    try {
        console.log('Migrating Messages...');
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Tables (Already in schema, but ensuring here or schema.sql handles it. Schema.sql is usually run first)
            // Assuming schema.sql logic is applied, but let's just make sure tables exist using the SQL provided in schema.sql
            // Actually, we should run the schema updates. But for this environment, I'll run the CREATE TABLE queries carefully.

            await client.query(`
                CREATE TABLE IF NOT EXISTS COM_MSG_MST (
                    MSG_ID       VARCHAR(50)   PRIMARY KEY,
                    MSG_KEY      VARCHAR(100)  NOT NULL,
                    MSG_TYPE     VARCHAR(10)   NOT NULL,
                    MSG_LEVEL    VARCHAR(10),
                    CATEGORY     VARCHAR(20)   NOT NULL,
                    ERR_CODE     VARCHAR(20),
                    EXPORT_YN    CHAR(1)       DEFAULT 'Y',
                    SYNC_STAT    VARCHAR(10)   DEFAULT 'CHANGED',
                    USE_YN       CHAR(1)       DEFAULT 'Y',
                    DESCRIPTION  VARCHAR(500),
                    REG_ID       VARCHAR(20)   NOT NULL,
                    REG_DT       TIMESTAMPTZ   DEFAULT CURRENT_TIMESTAMP,
                    MOD_ID       VARCHAR(20),
                    MOD_DT       TIMESTAMPTZ   DEFAULT CURRENT_TIMESTAMP
                );
            `);

            await client.query(`
                CREATE UNIQUE INDEX IF NOT EXISTS UIX_COM_MSG_MST_01 ON COM_MSG_MST (CATEGORY, MSG_KEY);
            `);

            await client.query(`
                 CREATE TABLE IF NOT EXISTS COM_MSG_LANG (
                    MSG_ID       VARCHAR(50)   NOT NULL,
                    LANG_CODE    VARCHAR(10)   NOT NULL,
                    MSG_TEXT     VARCHAR(4000) NOT NULL,
                    PRIMARY KEY (MSG_ID, LANG_CODE),
                    FOREIGN KEY (MSG_ID) REFERENCES COM_MSG_MST(MSG_ID) ON DELETE CASCADE
                );
            `);

            // Trigger
            await client.query(`
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_msg_modtime') THEN
                        CREATE TRIGGER update_msg_modtime
                        BEFORE UPDATE ON COM_MSG_MST
                        FOR EACH ROW
                        EXECUTE PROCEDURE update_config_timestamp();
                    END IF;
                END
                $$;
            `);


            // 2. Seed Data
            for (const item of SEED_DATA) {
                // Check exist
                const exist = await client.query(
                    "SELECT MSG_ID FROM COM_MSG_MST WHERE CATEGORY = $1 AND MSG_KEY = $2",
                    [item.cat, item.key]
                );

                let msgId;
                if (exist.rows.length > 0) {
                    msgId = exist.rows[0].msg_id;
                } else {
                    msgId = `MSG_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
                    await client.query(
                        `INSERT INTO COM_MSG_MST (MSG_ID, MSG_KEY, MSG_TYPE, CATEGORY, REG_ID)
                         VALUES ($1, $2, $3, $4, 'SYSTEM')`,
                        [msgId, item.key, item.type, item.cat]
                    );
                }

                // Insert/Update Langs
                // KO
                await client.query(
                    `INSERT INTO COM_MSG_LANG (MSG_ID, LANG_CODE, MSG_TEXT)
                     VALUES ($1, 'ko', $2)
                     ON CONFLICT (MSG_ID, LANG_CODE) DO UPDATE SET MSG_TEXT = EXCLUDED.MSG_TEXT`,
                    [msgId, item.ko]
                );
                // EN
                await client.query(
                    `INSERT INTO COM_MSG_LANG (MSG_ID, LANG_CODE, MSG_TEXT)
                     VALUES ($1, 'en', $2)
                     ON CONFLICT (MSG_ID, LANG_CODE) DO UPDATE SET MSG_TEXT = EXCLUDED.MSG_TEXT`,
                    [msgId, item.en]
                );
            }

            await client.query('COMMIT');
            console.log('Messages migrated successfully.');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
