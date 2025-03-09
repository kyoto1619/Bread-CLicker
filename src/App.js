import './App.css';
import { useState, useEffect } from 'react';
import backgroundImage from './Bg.png';

function App() {
  const [points, setPoints] = useState(0);
  const [scale, setScale] = useState(1);
  const [hasAutoClicker, setHasAutoClicker] = useState(false);
  const [autoClickerSpeed, setAutoClickerSpeed] = useState(5000); // 5 seconds
  const [autoClickerLevel, setAutoClickerLevel] = useState(1);
  const [clickPower, setClickPower] = useState(1);
  const [clickPowerLevel, setClickPowerLevel] = useState(1);

  const animateBreadClick = () => {
    setScale(0.9);
    setTimeout(() => setScale(1), 100);
  };

  const handleClick = () => {
    setPoints(prev => prev + clickPower);
    animateBreadClick();
  };

  const buyAutoClicker = () => {
    if (points >= 30) {
      setPoints(prev => prev - 30);
      setHasAutoClicker(true);
    }
  };

  const upgradeClickPower = () => {
    if (points >= 50) {
      setPoints(prev => prev - 50);
      setClickPower(prev => prev + 2);
      setClickPowerLevel(prev => prev + 1);
    }
  };

  const upgradeAutoClicker = () => {
    const upgradeCost = 30;
    if (points >= upgradeCost && autoClickerSpeed > 1000) { // Don't go faster than 1 second
      setPoints(prev => prev - upgradeCost);
      setAutoClickerSpeed(prev => prev - 1000);
      setAutoClickerLevel(prev => prev + 1);
    }
  };

  useEffect(() => {
    let autoClickInterval;
    if (hasAutoClicker) {
      autoClickInterval = setInterval(() => {
        setPoints(prev => prev + clickPower);
        animateBreadClick();
      }, autoClickerSpeed);
    }
    return () => clearInterval(autoClickInterval);
  }, [hasAutoClicker, autoClickerSpeed, clickPower]);

  return (
    <div className="App" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="spinning-background"></div>
      <div className="bread-game">
        <h1>Bread Points: {points}</h1>
        <div className="points-info">
          Points per click: {clickPower}
        </div>
        <div 
          className="bread"
          onClick={handleClick}
          style={{ transform: `scale(${scale})` }}
        >
          <img 
            src="/bread.png" 
            alt="Bread" 
            className="bread-image"
          />
        </div>
        <div className="shop">
          {!hasAutoClicker ? (
            <button 
              className={`shop-button ${points >= 30 ? 'available' : 'unavailable'}`}
              onClick={buyAutoClicker}
            >
              Buy Auto Clicker (30 points)
            </button>
          ) : (
            <button 
              className={`shop-button ${points >= 30 ? 'available' : 'unavailable'}`}
              onClick={upgradeAutoClicker}
            >
              Upgrade Auto Clicker - Level {autoClickerLevel} ({(autoClickerSpeed / 1000).toFixed(1)}s)
            </button>
          )}
          <button 
            className={`shop-button ${points >= 50 ? 'available' : 'unavailable'}`}
            onClick={upgradeClickPower}
          >
            Increase Click Power - Level {clickPowerLevel} (+2 points/click) (50 points)
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
