import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- Supabase 설정 ---
const supabaseUrl = 'https://lxgjgzgoakykzpgwsqst.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4Z2pnemdvYWt5a3pwZ3dzcXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4OTY0MTYsImV4cCI6MjA4NDQ3MjQxNn0.lt-QO3APUllRu5mry9huHa2SZQ2UqmujUcXvZA-qnBA';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ---------------------------------
// TODO: 'sam deploy' 후 출력되는 API Gateway URL로 이 값을 변경해주세요.
const API_URL = 'https://zobi3rp9hh.execute-api.ap-northeast-2.amazonaws.com/Stage';
// ---------------------------------


function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // onAuthStateChange 리스너는 초기 세션 로딩과 SUBSEQUENT 인증 상태 변경을 모두 처리합니다.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // 로그아웃 시 프로필 정보 초기화
      if (!session) {
        setProfile(null);
        setError(null);
      }
    });

    // 컴포넌트가 언마운트될 때 리스너를 정리합니다.
    return () => subscription.unsubscribe();
  }, []);

  // 세션이 변경될 때마다 백엔드에서 프로필 정보를 가져옵니다.
  useEffect(() => {
    if (session) {
      getProfile();
    }
  }, [session]);

  // 백엔드 /profile 엔드포인트를 호출하는 함수
  async function getProfile() {
    if (!API_URL || API_URL === 'YOUR_API_GATEWAY_URL') {
      setError("API_URL을 설정해주세요. 'sam deploy' 후 출력된 URL로 교체해야 합니다.");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setProfile(data);

    } catch (e) {
      console.error("Error fetching profile:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Google 로그인 함수
  async function googleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      console.error('Error logging in:', error.message);
    }
  }

  // 로그아웃 함수
  async function signOut() {
    setProfile(null);
    setError(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    }
  }

  return (
    <div>
      <h1>Supabase + React + AWS Lambda</h1>
      <p>Google 계정으로 로그인하고 백엔드에서 프로필 정보를 가져옵니다.</p>
      
      {!session ? (
        <button onClick={googleLogin}>
          Google 계정으로 로그인
        </button>
      ) : (
        <div>
          <h2>환영합니다, {session.user.email}</h2>
          <button onClick={signOut}>로그아웃</button>

          <hr />

          <h3>백엔드 응답:</h3>
          {loading && <p>프로필 정보를 불러오는 중...</p>}
          {error && <p style={{ color: 'red' }}>오류: {error}</p>}
          {profile && (
            <pre style={{ textAlign: 'left', background: '#f0f0f0', padding: '1rem' }}>
              {JSON.stringify(profile, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
