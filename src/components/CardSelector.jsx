import React, { useState, useEffect } from 'react';
import './CardSelector.css';

const TOTAL_CARDS = 78;
const MAX_SELECTION = 3;

const prompts = [
  "첫 번째 카드는 당신의 과거, 감정 그리고 내면을 의미합니다.",
  "두 번째 카드는 당신의 현재, 행동 그리고 외면을 의미합니다.",
  "마지막 카드는 당신의 미래, 이해 그리고 균형을 의미합니다.",
  "선택을 확정하시겠습니까?"
];

function CardSelector({ onCardSelect }) {
  const [selectedCards, setSelectedCards] = useState([]);
  const [promptText, setPromptText] = useState(prompts[0]);
  const [isPromptVisible, setIsPromptVisible] = useState(true);

  useEffect(() => {
    const nextPromptIndex = selectedCards.length;
    if (nextPromptIndex < MAX_SELECTION) {
      setIsPromptVisible(false);

      const timer = setTimeout(() => {
        setPromptText(prompts[nextPromptIndex]);
        setIsPromptVisible(true);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [selectedCards.length]);

  const handleClick = (cardIndex) => {
    if (selectedCards.length === MAX_SELECTION) return;

    const isAlreadySelected = selectedCards.includes(cardIndex);

    if (isAlreadySelected) {
      setSelectedCards(currentCards => currentCards.filter(id => id !== cardIndex));
    } else {
      if (selectedCards.length < MAX_SELECTION) {
        setSelectedCards(currentCards => [...currentCards, cardIndex]);
      }
    }
  };
  
  const handleReconsider = () => {
    setSelectedCards(currentCards => currentCards.slice(0, currentCards.length - 1));
  };

  return (
    <div className="card-selector-container">
      <div className={`selection-prompt ${isPromptVisible ? '' : 'fade-out'}`}>
        {promptText}
      </div>

      <div className="card-grid">
        {Array.from({ length: TOTAL_CARDS }).map((_, cardIndex) => {
          const isPicked = selectedCards.includes(cardIndex);
          const cardClassName = `tarot-card ${isPicked ? 'picked' : ''}`;
          
          return (
            <div
              key={cardIndex}
              className={cardClassName}
              style={{ animationDelay: `${cardIndex * 0.015}s` }}
              onClick={() => handleClick(cardIndex)}
            />
          );
        })}
      </div>

      {selectedCards.length === MAX_SELECTION && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>{prompts[3]}</p>
            <div className="modal-actions">
              <button className="modal-button cancel" onClick={handleReconsider}>
                선택바꾸기
              </button>
              <button className="modal-button confirm" onClick={() => onCardSelect(selectedCards)}>
                확인하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CardSelector;