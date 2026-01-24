import React, { useState } from 'react';
import './Result.css';

function Result({ result, goToHome, api_url, session }) {
  const [shareUrl, setShareUrl] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState('');

  if (!result) {
    return null;
  }

  const { cards, reading } = result;

  const readingParts = [
    { title: '과거', card: cards[0], text: reading.past },
    { title: '현재', card: cards[1], text: reading.present },
    { title: '미래', card: cards[2], text: reading.future },
  ];

  const handleShare = async () => {
    if (!api_url || !session) {
      setShareError('공유 기능에 필요한 정보가 없습니다. 다시 로그인해주세요.');
      return;
    }
    
    setIsSharing(true);
    setShareError('');
    setShareUrl('');

    try {
      const response = await fetch(`${api_url}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(result),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '공유 링크 생성에 실패했습니다.');
      }

      const data = await response.json();
      // Use the domain from the current window location for the share URL
      const shareBaseUrl = window.location.origin;
      const newShareUrl = `${shareBaseUrl}/share.html?id=${data.share_id}`;
      setShareUrl(newShareUrl);

    } catch (e) {
      console.error("Error creating share link:", e);
      setShareError(e.message);
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        alert('공유 링크가 클립보드에 복사되었습니다!');
      })
      .catch(err => {
        console.error('클립보드 복사 실패:', err);
        alert('클립보드 복사에 실패했습니다.');
      });
  };

  return (
    <div className="result-container">
      {readingParts.map((part, index) => (
        <div key={index} className="reading-block">
          <div className="card-display">
            <img 
              src={part.card.image_url} 
              alt={part.card.name} 
              className={part.card.orientation === '역방향' ? 'reversed-card' : ''}
            />
            <div className="card-name">{part.card.name} ({part.card.orientation})</div>
            <div className="card-meaning">{part.card.meaning}</div>
          </div>
          <div className="interpretation-text">
            <h4>{part.title}</h4>
            <p>{part.text}</p>
          </div>
        </div>
      ))}

      <div className="summary-section">
        <h3>총평</h3>
        <div className="summary-text">{reading.summary}</div>
      </div>

      <div className="home-button-container">
        <button onClick={goToHome} className="home-button">
          홈으로 돌아가기
        </button>
        <button onClick={handleShare} className="share-button" disabled={isSharing}>
          {isSharing ? '링크 생성 중...' : '공유하기'}
        </button>
      </div>

      {shareError && <p className="error-message">{shareError}</p>}

      {shareUrl && (
        <div className="share-url-container">
          <p>공유 링크가 생성되었습니다!</p>
          <div className="share-input-wrapper">
            <input type="text" value={shareUrl} readOnly />
            <button onClick={copyToClipboard}>복사</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Result;