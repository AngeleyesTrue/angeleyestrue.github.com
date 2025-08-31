import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

const Auth = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 인증 상태 변화 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
    } catch (error) {
      alert('로그인 중 오류가 발생했습니다: ' + error.message);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      alert('로그아웃 중 오류가 발생했습니다: ' + error.message);
    }
    setLoading(false);
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      {!session ? (
        <div style={{
          border: '1px solid #ddd',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h2>로그인이 필요합니다</h2>
          <p>Google 계정으로 로그인해주세요</p>
          <button
            onClick={handleGoogleLogin}
            style={{
              backgroundColor: '#4285f4',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            🔗 Google로 로그인
          </button>
        </div>
      ) : (
        <div style={{
          border: '1px solid #28a745',
          padding: '20px',
          borderRadius: '8px',
          backgroundColor: '#d4edda'
        }}>
          <h2>✅ 로그인 성공!</h2>
          <p><strong>환영합니다!</strong></p>
          <div style={{ marginBottom: '15px' }}>
            <p><strong>이메일:</strong> {session.user.email}</p>
            <p><strong>이름:</strong> {session.user.user_metadata?.full_name || 'N/A'}</p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
};

export default Auth;