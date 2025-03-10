import './App.css';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import backgroundImage from './Bg.png';

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
  
  // Audio handling system
  const audioPool = useRef([...Array(3)].map(() => new Audio('/Click.wav')));
  const currentAudioIndex = useRef(0);
  const drinkSound = useRef(new Audio('/drink.wav'));
  const whooshSound = useRef(new Audio('/whoosh.wav'));
  
  // Initialize audio
  useEffect(() => {
    // Pre-load all audio
    audioPool.current.forEach(audio => {
      audio.load();
      audio.volume = 1.0;
    });
    drinkSound.current.load();
    whooshSound.current.load();
  }, []);

  const playClickSound = useCallback(() => {
    const audio = audioPool.current[currentAudioIndex.current];
    if (audio.paused || audio.ended) {
      audio.currentTime = 0;
      audio.play().catch(error => console.log('Audio play failed:', error));
      currentAudioIndex.current = (currentAudioIndex.current + 1) % audioPool.current.length;
    }
  }, []);

  const playDrinkSound = useCallback(() => {
    if (drinkSound.current.paused || drinkSound.current.ended) {
      drinkSound.current.currentTime = 0;
      drinkSound.current.play().catch(error => console.log('Audio play failed:', error));
    }
  }, []);

  const playWhooshSound = useCallback(() => {
    if (whooshSound.current.paused || whooshSound.current.ended) {
      whooshSound.current.currentTime = 0;
      whooshSound.current.play().catch(error => console.log('Audio play failed:', error));
    }
  }, []);

  const animateBreadClick = useCallback(() => {
    setScale(0.9);
    setTimeout(() => setScale(1), 100);
  }, []);

  const handleClick = useCallback(() => {
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
  }, [clickPower, nextSecretThreshold, playClickSound, animateBreadClick]);

  const buyAutoClicker = useCallback(() => {
    if (points >= 30) {
      setPoints(prev => prev - 30);
      setHasAutoClicker(true);
    }
  }, [points]);

  const upgradeClickPower = useCallback(() => {
    if (points >= 50) {
      setPoints(prev => prev - 50);
      setClickPower(prev => prev + 2);
      setClickPowerLevel(prev => prev + 1);
    }
  }, [points]);

  const upgradeAutoClicker = useCallback(() => {
    const upgradeCost = 30;
    if (points >= upgradeCost && autoClickerSpeed > 1000) { // Don't go faster than 1 second
      setPoints(prev => prev - upgradeCost);
      setAutoClickerSpeed(prev => prev - 1000);
      setAutoClickerLevel(prev => prev + 1);
    }
  }, [points, autoClickerSpeed]);

  const changeBreadIcon = useCallback(() => {
    if (secretPoints >= 3 && !secretButtonUsed) {
      setSecretPoints(prev => prev - 3);
      setBreadIcon(prev => prev === 'bread.png' ? 'bread2.png' : 'bread.png');
      setSecretButtonUsed(true);
    }
  }, [secretPoints, secretButtonUsed]);

  const changeToDrink = useCallback(() => {
    if (secretPoints >= 10 && !secretButton2Used) {
      setSecretPoints(prev => prev - 10);
      setBreadIcon('drink.png');
      setSecretButton2Used(true);
      playDrinkSound();
    }
  }, [secretPoints, secretButton2Used, playDrinkSound]);

  const toggleShop = useCallback(() => {
    setIsShopOpen(prev => !prev);
    playWhooshSound();
  }, [playWhooshSound]);

  // Memoize shop buttons to prevent unnecessary re-renders
  const shopButtons = useMemo(() => (
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
  ), [points, hasAutoClicker, autoClickerLevel, autoClickerSpeed, clickPowerLevel, 
      secretPoints, secretButtonUsed, secretButton2Used, buyAutoClicker, 
      upgradeAutoClicker, upgradeClickPower, changeBreadIcon, changeToDrink]);

  useEffect(() => {
    let autoClickInterval;
    if (hasAutoClicker) {
      let lastAutoClick = 0;
      autoClickInterval = setInterval(() => {
        const now = Date.now();
        if (now - lastAutoClick >= autoClickerSpeed) {
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
          lastAutoClick = now;
        }
      }, Math.min(100, autoClickerSpeed)); // More precise timing check
    }
    return () => clearInterval(autoClickInterval);
  }, [hasAutoClicker, autoClickerSpeed, clickPower, nextSecretThreshold, playClickSound, animateBreadClick]);

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
        {shopButtons}
      </div>
    </div>
  );
}

export default App;
