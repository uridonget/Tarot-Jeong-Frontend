import React from 'react';
import './Sidebar.css';

function Sidebar({ profile, session, signOut, isSidebarOpen, changeView }) { 
  // Show a loading/placeholder state if profile data isn't available yet
  if (!profile || !session) {
    return (
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        {/* 내부 닫기 버튼 제거됨 */}
        <div className="profile-section">
          <div className="profile-image" style={{ backgroundColor: '#333' }}></div>
          <p className="profile-nickname">Loading...</p>
        </div>
        <div className="credits-section">
          <p className="credits-label">남은 크레딧</p>
          <p className="credits-value">-</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      {/* 내부 닫기 버튼 제거됨 */}
      <div className="profile-section">
        <img 
          src={profile.profile_image_url || session.user.user_metadata?.avatar_url} 
          alt="Profile" 
          className="profile-image" 
        />
        <h2 className="profile-nickname">{profile.nickname}</h2>
      </div>

      <div className="credits-section">
        <p className="credits-label">남은 크레딧</p>
        <p className="credits-value">{profile.credit ?? 'N/A'}</p>
      </div>

      <button onClick={() => changeView('board')} className="sidebar-button">
        게시판
      </button>
      
      <button onClick={signOut} className="sidebar-logout-button">
        로그아웃
      </button>
    </aside>
  );
}

export default Sidebar;
