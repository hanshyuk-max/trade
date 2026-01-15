import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translations
const resources = {
    en: {
        translation: {
            "Welcome Back": "Welcome Back",
            "Sign in to manage your portfolio": "Sign in to manage your portfolio",
            "Username": "Username",
            "Password": "Password",
            "Sign In": "Sign In",
            "Don't have an account?": "Don't have an account?",
            "Create an Account": "Create an Account",
            "Protected by Antigravity Intelligence": "Protected by Antigravity Intelligence"
        }
    },
    ko: {
        translation: {
            "Welcome Back": "환영합니다",
            "Sign in to manage your portfolio": "포트폴리오 관리를 위해 로그인하세요",
            "Username": "사용자명",
            "Password": "비밀번호",
            "Sign In": "로그인",
            "Don't have an account?": "계정이 없으신가요?",
            "Create an Account": "계정 만들기",
            "Protected by Antigravity Intelligence": "Antigravity Intelligence 보안"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "en", // default language
        fallbackLng: "en",
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
