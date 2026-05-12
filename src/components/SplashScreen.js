import React, { useEffect, useState } from 'react';
import './SplashScreen.css';

const SplashScreen = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const duration = 2200;
    const interval = 30;
    const step = (100 / duration) * interval;
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      setProgress(Math.min(current, 100));
      if (current >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(onFinish, 400);
        }, 300);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="splash-content">
        <img
          src="/logo.jpg"
          alt="LexPanther"
          className="splash-logo-img"
        />
        <div className="splash-wordmark">
          <span className="splash-lex">LEX</span>
          <span className="splash-panther">PANTHER</span>
        </div>
        <p className="splash-tagline">OVERSEAS SMARTPHONE</p>
        <div className="splash-bar-bg">
          <div className="splash-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
