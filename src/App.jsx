import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css';
import './index.css';
import Sidebar from './components/Sidebar';
import CardSelector from './components/CardSelector';
import Loading from './components/Loading';
import Result from './components/Result';

// --- Supabase 설정 ---
const supabaseUrl = 'https://lxgjgzgoakykzpgwsqst.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4Z2pnemdvYWt5a3pwZ3dzcXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4OTY0MTYsImV4cCI6MjA4NDQ3MjQxNn0.lt-QO3APUllRu5mry9huHa2SZQ2UqmujUcXvZA-qnBA';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ---------------------------------
// TODO: 'sam deploy' 후 출력되는 API Gateway URL로 이 값을 변경해주세요.
const API_URL = 'https://zobi3rp9hh.execute-api.ap-northeast-2.amazonaws.com/v1';
// ---------------------------------

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- 타로 상담을 위한 State ---
  const [concern, setConcern] = useState(''); // 사용자의 고민 내용
  const [tarotReading, setTarotReading] = useState(null); // 타로 상담 결과
  const [isReadingLoading, setIsReadingLoading] = useState(false); // 타로 상담 로딩 상태
  const [readingError, setReadingError] = useState(null); // 타로 상담 오류
  const [view, setView] = useState('form'); // 'form', 'selecting', 'loading', 'result'

  // --- 사이드바 상태 추가 ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setProfile(null);
        setError(null);
        setConcern('');
        setTarotReading(null);
        setReadingError(null);
        setIsSidebarOpen(false); // 로그아웃 시 사이드바 닫기
        setView('form');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      getProfile();
    }
  }, [session?.user?.id]);

  async function getProfile() {
    if (!API_URL || API_URL.includes('YOUR_API_GATEWAY_URL')) {
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

  async function startTarotReading() {
    if (!concern.trim()) {
      setReadingError('고민 내용을 입력해주세요.');
      return;
    }
    setReadingError(null);
    setView('selecting');
  }

  async function handleCardSelection(selectedCards) {
    setView('loading');
    setReadingError(null);
    setTarotReading(null);

    try {
      const response = await fetch(`${API_URL}/tarot-reading`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ concern: concern, selected_cards: selectedCards }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTarotReading(data);
      setView('result');

    } catch (e) {
      console.error("Error fetching tarot reading:", e);
      setReadingError(e.message);
      setView('form'); // 오류 발생 시 폼으로 돌아가기
    }
  }


  async function googleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      console.error('Error logging in:', error.message);
    }
  }

  async function signOut() {
    setProfile(null);
    setError(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    }
  }
  
  const renderMainContent = () => {
    switch (view) {
      case 'selecting':
        return <CardSelector onCardSelect={handleCardSelection} />;
      case 'loading':
        return <Loading />;
      case 'result':
        return <Result result={tarotReading} />;
      case 'form':
      default:
        return (
          <div className="auth-container">
            <h1>타로점 보기</h1>
            <p>당신의 고민을 입력하고 타로점 해석을 받아보세요.</p>
            <hr />
            <div>
              <h3>고민 입력</h3>
              <textarea
                value={concern}
                onChange={(e) => setConcern(e.target.value)}
                placeholder="예: 현재 진행하고 있는 프로젝트가 잘 될 수 있을까요?"
                rows="4"
                disabled={isReadingLoading}
              />
              <button 
                onClick={startTarotReading} 
                disabled={isReadingLoading}
              >
                타로 카드 선택하기
              </button>
            </div>
            {readingError && <p className="error-message">오류: {readingError}</p>}
          </div>
        );
    }
  };


  return (
    <div className="App">
      {!session ? (
        <div className="auth-container">
          <h1>타로점 보기</h1>
          <p>Google 계정으로 로그인하고, 고민을 입력하여 Gemini가 해석해주는 타로점을 보세요.</p>
          <button onClick={googleLogin}>
            Google 계정으로 로그인
          </button>
        </div>
      ) : (
        <>
          <button onClick={toggleSidebar} className="sidebar-toggle-button">
            ☰
          </button>

          <div className={`main-content-area ${isSidebarOpen ? 'shifted' : ''}`}>
            {renderMainContent()}
          </div>

          <Sidebar profile={profile} session={session} signOut={signOut} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        </>
      )}
    </div>
  );
}

export default App;