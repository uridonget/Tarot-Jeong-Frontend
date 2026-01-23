import React from 'react';
import './Result.css';

function Result({ result }) {
  if (!result) {
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
    </div>
  );
}

export default Result;