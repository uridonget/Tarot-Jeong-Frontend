import React from 'react';
import './Result.css';

function Result({ result, goToHome }) {
  if (!result) {
    // 결과가 아직 로드되지 않았을 때 null 대신 로딩 표시나 간단한 메시지를 반환하는 것이 사용자 경험에 더 좋습니다.
    // App.jsx에서 이미 'loading' 상태를 처리하므로, 여기서는 null을 반환해도 괜찮습니다.
    return null;
  }

  const { cards, reading } = result;

  const readingParts = [
    { title: '과거', card: cards[0], text: reading.past },
    { title: '현재', card: cards[1], text: reading.present },
    { title: '미래', card: cards[2], text: reading.future },
  ];

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
      </div>
    </div>
  );
}

export default Result;