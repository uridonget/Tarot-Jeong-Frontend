import React from 'react';
import './Loading.css';

function Loading() {
  const text = "Loading...";

  return (
    <div className="loading-container">
      <div className="stars">
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
      </div>
      <div className="loading-text">
        {text.split('').map((char, index) => (
          <span 
            key={index} 
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {char === ' ' ? '\u00A0' : char} 
          </span>
        ))}
      </div>
    </div>
  );
}

export default Loading;