import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css'; // 새로 업데이트된 App.css 임포트
import './index.css'; // index.css도 임포트 (기존에 있었을 경우)
import Sidebar from './components/Sidebar'; // Sidebar 컴포넌트 임포트

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

  async function getTarotReading() {
    if (!concern.trim()) {
      setReadingError('고민 내용을 입력해주세요.');
      return;
    }
    
    setIsReadingLoading(true);
    setReadingError(null);
    setTarotReading(null);

    try {
      const response = await fetch(`${API_URL}/tarot-reading`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ concern: concern }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTarotReading(data);

    } catch (e) {
      console.error("Error fetching tarot reading:", e);
      setReadingError(e.message);
    } finally {
      setIsReadingLoading(false);
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

  return (
    <div className="App">
      {/* 로그인 전 화면 */}
      {!session ? (
        <div className="auth-container">
          <h1>타로점 보기</h1>
          <p>Google 계정으로 로그인하고, 고민을 입력하여 Gemini가 해석해주는 타로점을 보세요.</p>
          <button onClick={googleLogin}>
            Google 계정으로 로그인
          </button>
        </div>
      ) : (
        <> {/* 로그인 후 레이아웃 */}
          {/* 사이드바 토글 버튼 */}
          <button onClick={toggleSidebar} className="sidebar-toggle-button">
            ☰
          </button>

          <div className={`main-content-area ${isSidebarOpen ? 'shifted' : ''}`}> {/* 메인 콘텐츠 영역 */}
            <div className="auth-container"> {/* 메인 콘텐츠도 auth-container로 감싸서 스타일 유지 */}
              <h1>타로점 보기</h1> {/* 타이틀은 메인 콘텐츠에 유지 */}
              <p>당신의 고민을 입력하고 타로점 해석을 받아보세요.</p>

              <hr />

              {/* --- 타로 상담 UI --- */}
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
                  onClick={getTarotReading} 
                  disabled={isReadingLoading}
                >
                  {isReadingLoading ? '해석 중...' : '타로점 보기'}
                </button>
              </div>

              {/* --- 타로 상담 결과 표시 --- */}
              {readingError && <p className="error-message">오류: {readingError}</p>}
              
              {tarotReading && (
                <div style={{ marginTop: '2rem', textAlign: 'left' }}>
                  <h4>상담 결과</h4>
                  
                  <h5>뽑힌 카드</h5>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {tarotReading.cards.map(card => (
                      <div key={card.name} style={{ border: '1px solid #7b68ed', padding: '0.5rem', borderRadius: '4px', backgroundColor: 'rgba(40, 44, 52, 0.8)' }}>
                        <strong>{card.name}</strong> ({card.orientation})
                      </div>
                    ))}
                  </div>

                  <h5>과거</h5>
                  <p>{tarotReading.reading.past}</p>
                  
                  <h5>현재</h5>
                  <p>{tarotReading.reading.present}</p>
                  
                  <h5>미래</h5>
                  <p>{tarotReading.reading.future}</p>

                  <h5>총평 및 조언</h5>
                  <p>{tarotReading.reading.summary}</p>
                </div>
              )}
            </div> {/* 메인 콘텐츠 auth-container 끝 */}
          </div> {/* 메인 콘텐츠 영역 끝 */}

          <Sidebar profile={profile} session={session} signOut={signOut} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        </>
      )}
    </div>
  );
}

export default App;