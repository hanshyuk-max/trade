import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Trade from './pages/Trade';
import History from './pages/History';
import Capital from './pages/Capital';
import Users from './pages/Users';

// Environment Check
const checkEnvironment = () => {
  if (typeof window !== 'undefined') {
    const isVercel = window.location.hostname.includes('vercel.app');
    const isLocalBackend = import.meta.env.VITE_API_URL === 'http://localhost:3000' || !import.meta.env.VITE_API_URL;

    if (isVercel && isLocalBackend) {
      alert(
        "⚠️ 잘못된 접속 경로입니다!\n\n" +
        "현재 Vercel(클라우드) 주소로 접속하셨습니다.\n" +
        "하지만 백엔드 서버는 회원님의 PC(Localhost)에 있습니다.\n\n" +
        "브라우저 주소창에 아래 주소를 직접 입력해서 테스트해주세요:\n" +
        "👉 http://localhost:5173"
      );
    }
  }
};
checkEnvironment();

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/trade" element={<Trade />} />
              <Route path="/history" element={<History />} />
              <Route path="/capital" element={<Capital />} />
              <Route path="/users" element={<Users />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
