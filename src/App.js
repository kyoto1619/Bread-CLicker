import './App.css';
import { useState, useEffect, useRef } from 'react';
import backgroundImage from './Bg.png';
import susImage from './sus.jpg';

function App() {
  const [points, setPoints] = useState(0);
  const [scale, setScale] = useState(1);
  const [hasAutoClicker, setHasAutoClicker] = useState(false);
  const [autoClickerSpeed, setAutoClickerSpeed] = useState(5000); // 5 seconds
  const [autoClickerLevel, setAutoClickerLevel] = useState(1);
  const [clickPower, setClickPower] = useState(1);
  const [clickPowerLevel, setClickPowerLevel] = useState(1);
  const [breadIcon, setBreadIcon] = useState('bread.png');
  const [secretPoints, setSecretPoints] = useState(0);
  const [nextSecretThreshold, setNextSecretThreshold] = useState(50);
  const [secretButtonUsed, setSecretButtonUsed] = useState(false);
  const [secretButton2Used, setSecretButton2Used] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [particles, setParticles] = useState([]);
  const clickSound = useRef(new Audio('/Click.wav'));
  const drinkSound = useRef(new Audio('/drink.wav'));
  const whooshSound = useRef(new Audio('/whoosh.wav'));

  const playClickSound = () => {
    clickSound.current.currentTime = 0; // Reset sound to start
    clickSound.current.play();
  };

  const playDrinkSound = () => {
    drinkSound.current.currentTime = 0;
    drinkSound.current.play();
  };

  const playWhooshSound = () => {
    whooshSound.current.currentTime = 0;
    whooshSound.current.play();
  };

  const animateBreadClick = () => {
    setScale(0.9);
    setTimeout(() => setScale(1), 100);
  };

  const handleClick = () => {
    const newPoints = points + clickPower;
    setPoints(newPoints);
    playClickSound();
    
    // Check if we've reached the next secret point threshold
    if (newPoints >= nextSecretThreshold) {
      setSecretPoints(prev => prev + 1);
      setNextSecretThreshold(prev => prev + 50);
    }
    
    animateBreadClick();
  };

  const createSusParticle = (x, y) => {
    const id = Date.now();
    const endX = (Math.random() - 0.5) * 300; // Random x direction
    const endY = -100 - Math.random() * 200; // Always fly upward
    const rotation = Math.random() * 360;
    
    const particle = {
      id,
      x,
      y,
      endX,
      endY,
      rotation
    };

    setParticles(prev => [...prev, particle]);

    // Remove particle after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id));
    }, 1000);
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

  const changeBreadIcon = () => {
    if (secretPoints >= 3 && !secretButtonUsed) {
      setSecretPoints(prev => prev - 3);
      setBreadIcon(prev => prev === 'bread.png' ? 'bread2.png' : 'bread.png');
      setSecretButtonUsed(true);
    }
  };

  const changeToDrink = () => {
    if (secretPoints >= 10 && !secretButton2Used) {
      setSecretPoints(prev => prev - 10);
      setBreadIcon('drink.png');
      setSecretButton2Used(true);
      playDrinkSound();
    }
  };

  const toggleShop = () => {
    setIsShopOpen(prev => !prev);
    playWhooshSound();
  };

  useEffect(() => {
    let autoClickInterval;
    if (hasAutoClicker) {
      autoClickInterval = setInterval(() => {
        setPoints(prev => {
          const newPoints = prev + clickPower;
          if (newPoints >= nextSecretThreshold) {
            setSecretPoints(prevSecret => prevSecret + 1);
            setNextSecretThreshold(prevThreshold => prevThreshold + 50);
          }
          return newPoints;
        });
        
        playClickSound();
        animateBreadClick();
      }, autoClickerSpeed);
    }
    return () => clearInterval(autoClickInterval);
  }, [hasAutoClicker, autoClickerSpeed, clickPower, nextSecretThreshold]);

  return (
    <div className="App" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="spinning-background"></div>
      <div className="bread-game">
        <h1>Bread Points: {points}</h1>
        <div className="points-info">
          Points per click: {clickPower}
        </div>
        <div className="secret-points-info">
          Secret Bread Points: {secretPoints}
          <br />
          Next Secret Point: {nextSecretThreshold} points
        </div>
        <div 
          className="bread"
          onClick={handleClick}
          style={{ transform: `scale(${scale})` }}
        >
          <img 
            src={`/${breadIcon}`}
            alt="Bread" 
            className="bread-image"
          />
        </div>
        <button className="shop-toggle" onClick={toggleShop}>
          🛒
        </button>
      </div>
      <div className={`shop-panel ${isShopOpen ? 'open' : ''}`}>
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
          <button 
            className={`shop-button secret-button ${secretButtonUsed ? 'used' : secretPoints >= 3 ? 'available' : 'unavailable'}`}
            onClick={changeBreadIcon}
            disabled={secretButtonUsed}
          >
            Secret Button One (Requires 3 Secret Bread Points)
          </button>
          <button 
            className={`shop-button secret-button ${secretButton2Used ? 'used' : secretPoints >= 10 ? 'available' : 'unavailable'}`}
            onClick={changeToDrink}
            disabled={secretButton2Used}
          >
            Secret Button Two (Requires 10 Secret Bread Points)
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
