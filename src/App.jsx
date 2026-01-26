import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css';
import './index.css';
import Sidebar from './components/Sidebar';
import CardSelector from './components/CardSelector';
import Loading from './components/Loading';
import Result from './components/Result';
import NotFound from './components/NotFound';
import Forbidden from './components/Forbidden';
import Board from './components/Board';
import PostEditor from './components/PostEditor';
import PostView from './components/PostView';

// --- Supabase 설정 ---
const supabaseUrl = 'https://lxgjgzgoakykzpgwsqst.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4Z2pnemdvYWt5a3pwZ3dzcXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4OTY0MTYsImV4cCI6MjA4NDQ3MjQxNn0.lt-QO3APUllRu5mry9huHa2SZQ2UqmujUcXvZA-qnBA';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ---------------------------------
// TODO: 'sam deploy' 후 출력되는 API Gateway URL로 이 값을 변경해주세요.
const API_URL = 'https://api.haechan.net';
// ---------------------------------

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- 타로 상담을 위한 State ---
  const [concern, setConcern] = useState('');
  const [tarotReading, setTarotReading] = useState(() => {
    const saved = sessionStorage.getItem('tarotReading');
    return saved ? JSON.parse(saved) : null;
  });
  const [isReadingLoading, setIsReadingLoading] = useState(false);
  const [readingError, setReadingError] = useState(null);
  const [showCreditModal, setShowCreditModal] = useState(false); // 크레딧 모달 상태
  
  // --- 뷰 상태 ---
  // URL 해시에서 초기 뷰를 가져오거나 'form'으로 기본 설정
  const [view, setView] = useState(window.location.hash.substring(1) || 'form');

  // --- 사이드바 상태 ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // --- 뷰 변경 및 히스토리 관리 ---
  const changeView = (newView) => {
    window.location.hash = newView;
    // setView(newView)는 handleHashChange에서 처리하므로 중복 호출 방지
  };

  useEffect(() => {
    const handleHashChange = () => {
      setView(window.location.hash.substring(1) || 'form');
    };
  
    window.addEventListener('hashchange', handleHashChange);
    
    // 초기 뷰 설정
    handleHashChange();
  
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);


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
        sessionStorage.removeItem('tarotReading');
        setReadingError(null);
        setIsSidebarOpen(false);
        changeView('form');
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
        if (response.status === 403) {
          changeView('forbidden');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setProfile(data);

    } catch (e) {
      console.error("Error fetching profile:", e);
      setError(e.message);
    }
    finally {
      setLoading(false);
    }
  }

  async function startTarotReading() {
    if (!concern.trim()) {
      setReadingError('고민 내용을 입력해주세요.');
      return;
    }
    // 크레딧 부족 시 모달 표시
    if (profile && profile.credit <= 0) {
      setShowCreditModal(true);
      return;
    }
    setReadingError(null);
    changeView('selecting');
  }

  async function handleCardSelection(selectedCards) {
    changeView('loading');
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
        if (response.status === 403) {
          changeView('forbidden');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTarotReading(data);
      sessionStorage.setItem('tarotReading', JSON.stringify(data)); // Save to session storage
      changeView('result');
      // 로컬에서 크레딧을 1 차감하여 UI를 즉시 업데이트합니다.
      setProfile(prevProfile => ({
        ...prevProfile,
        credit: prevProfile.credit - 1
      }));

    } catch (e) {
      console.error("Error fetching tarot reading:", e);
      setReadingError(e.message);
      changeView('form'); // 오류 발생 시 폼으로 돌아가기
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
    sessionStorage.removeItem('tarotReading');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    }
  }

  const goToHome = () => {
    setTarotReading(null);
    setConcern('');
    setReadingError(null);
    sessionStorage.removeItem('tarotReading');
    changeView('form');
  };
  
  const renderMainContent = () => {
    const viewParts = view.split('/');
    const baseView = viewParts[0];
    const postId = viewParts.length > 1 ? viewParts[1] : null;

    switch (baseView) {
      case 'selecting':
        return <CardSelector onCardSelect={handleCardSelection} />;
      case 'loading':
        return <Loading />;
      case 'result':
        return <Result result={tarotReading} goToHome={goToHome} api_url={API_URL} session={session} />;
      case 'notfound':
        return <NotFound />;
      case 'forbidden':
        return <Forbidden />;
      case 'board':
        return <Board changeView={changeView} api_url={API_URL} />;
      case 'post':
        if (postId === 'new') {
          return <PostEditor session={session} api_url={API_URL} changeView={changeView} />;
        } else if (postId) {
          return <PostView postId={postId} api_url={API_URL} changeView={changeView} session={session} />;
        }
        return <NotFound />;
      case 'form':
      default:
        // 'form' 또는 정의되지 않은 모든 경로는 홈으로
        if (baseView !== 'form' && view !== '') return <NotFound />;
        return (
          <div className="auth-container">
            <h1>타로정</h1>
            <p>당신의 고민을 입력하고 타로점 해석을 받아보세요.</p>
            
            <div className="concern-input-wrapper">
              <textarea
                value={concern}
                onChange={(e) => setConcern(e.target.value)}
                placeholder="예: 현재 진행하고 있는 프로젝트가 잘 될 수 있을까요?"
                rows="4"
                maxLength="500"
                disabled={isReadingLoading}
              />
              <div className="char-counter">{concern.length}/500</div>
            </div>
            <button 
              onClick={startTarotReading} 
              disabled={isReadingLoading}
            >
              타로 카드 선택하기
            </button>
            {readingError && <p className="error-message">오류: {readingError}</p>}
          </div>
        );
    }
  };


  return (
    <div className="App">
      {!session ? (
        <div className="login-wrapper">
          <div className="auth-container">
            <h1>타로정</h1>
            <p>고민을 입력하여 Gemini가 해석해주는 타로점을 보세요.</p>
            <button onClick={googleLogin}>
              Google 계정으로 로그인
            </button>
          </div>
        </div>
      ) : (
        <>
          <button onClick={toggleSidebar} className="sidebar-toggle-button">
            ☰
          </button>

          <div className={`main-content-area ${isSidebarOpen ? 'shifted' : ''}`}>
            {/* 홈으로 이동 버튼 */}
            <button onClick={() => changeView('form')} className="home-button">
              🏠 홈으로
            </button>
            {renderMainContent()}
          </div>

          <Sidebar 
            profile={profile} 
            session={session} 
            signOut={signOut} 
            isSidebarOpen={isSidebarOpen} 
            changeView={changeView} 
          />

          {/* 크레딧 부족 모달 */}
          {showCreditModal && (
            <div className="credit-modal-overlay">
              <div className="credit-modal-content">
                <h2>크레딧 부족</h2>
                <p>타로점을 볼 크레딧이 부족합니다.</p>
                <button onClick={() => setShowCreditModal(false)}>확인</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;