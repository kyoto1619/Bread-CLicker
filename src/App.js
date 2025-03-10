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
  const [isMilkActive, setIsMilkActive] = useState(false);
  const [milkRotation, setMilkRotation] = useState(0);
  const [isMilkButtonUsed, setIsMilkButtonUsed] = useState(false);
  const [performanceMode, setPerformanceMode] = useState(true);
  
  // Audio handling system
  const audioPool = useRef([...Array(3)].map(() => new Audio('/Click.wav')));
  const currentAudioIndex = useRef(0);
  const drinkSound = useRef(new Audio('/drink.wav'));
  const whooshSound = useRef(new Audio('/whoosh.wav'));
  const buySound = useRef(new Audio('/buy.mp3'));
  
  // Initialize audio
  useEffect(() => {
    // Pre-load all audio
    audioPool.current.forEach(audio => {
      audio.load();
      audio.volume = 1.0;
    });
    drinkSound.current.load();
    whooshSound.current.load();
    buySound.current.load();
  }, []);

  const playClickSound = useCallback(() => {
    const audio = audioPool.current[currentAudioIndex.current];
    if (audio.paused || audio.ended) {
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch(() => {});
      }
      currentAudioIndex.current = (currentAudioIndex.current + 1) % audioPool.current.length;
    }
  }, []);

  const playDrinkSound = useCallback(() => {
    if (drinkSound.current.paused || drinkSound.current.ended) {
      drinkSound.current.currentTime = 0;
      const playPromise = drinkSound.current.play();
      if (playPromise) {
        playPromise.catch(() => {});
      }
    }
  }, []);

  const playWhooshSound = useCallback(() => {
    if (whooshSound.current.paused || whooshSound.current.ended) {
      whooshSound.current.currentTime = 0;
      const playPromise = whooshSound.current.play();
      if (playPromise) {
        playPromise.catch(() => {});
      }
    }
  }, []);

  const playBuySound = useCallback(() => {
    if (buySound.current.paused || buySound.current.ended) {
      buySound.current.currentTime = 0;
      const playPromise = buySound.current.play();
      if (playPromise) {
        playPromise.catch(() => {});
      }
    }
  }, []);

  // Click handling
  const clickQueue = useRef([]);
  const isProcessing = useRef(false);
  const isAnimating = useRef(false);

  // Process clicks in batches
  const processClickQueue = useCallback(() => {
    if (isProcessing.current || clickQueue.current.length === 0) return;
    
    isProcessing.current = true;
    const clicks = clickQueue.current;
    clickQueue.current = [];

    setPoints(prev => {
      let newPoints = prev;
      let secretPointsToAdd = 0;
      let nextThreshold = nextSecretThreshold;

      clicks.forEach(() => {
        newPoints += clickPower;
        if (newPoints >= nextThreshold) {
          secretPointsToAdd++;
          nextThreshold += 50;
        }
      });

      if (secretPointsToAdd > 0) {
        setSecretPoints(prev => prev + secretPointsToAdd);
        setNextSecretThreshold(nextThreshold);
      }

      return newPoints;
    });

    isProcessing.current = false;
  }, [clickPower, nextSecretThreshold]);

  // Process queue periodically
  useEffect(() => {
    const interval = setInterval(processClickQueue, 50);
    return () => clearInterval(interval);
  }, [processClickQueue]);

  const handleClick = useCallback(() => {
    // Add click to queue
    clickQueue.current.push(Date.now());

    // Handle animation and sound
    const now = Date.now();
    const lastClick = clickQueue.current[clickQueue.current.length - 2];
    const timeSinceLastClick = lastClick ? now - lastClick : Infinity;

    if (timeSinceLastClick > 50) {
      playClickSound();
      
      if (!isAnimating.current && !performanceMode) {
        isAnimating.current = true;
        setScale(0.9);
        setTimeout(() => {
          setScale(1);
          isAnimating.current = false;
        }, 100);
      }
    }
  }, [playClickSound, performanceMode]);

  const buyAutoClicker = useCallback(() => {
    if (points >= 30) {
      setPoints(prev => prev - 30);
      setHasAutoClicker(true);
      playBuySound();
    }
  }, [points, playBuySound]);

  const upgradeClickPower = useCallback(() => {
    if (points >= 50) {
      setPoints(prev => prev - 50);
      setClickPower(prev => prev + 2);
      setClickPowerLevel(prev => prev + 1);
      playBuySound();
    }
  }, [points, playBuySound]);

  const upgradeAutoClicker = useCallback(() => {
    const upgradeCost = 30;
    if (points >= upgradeCost && autoClickerSpeed > 1000) {
      setPoints(prev => prev - upgradeCost);
      setAutoClickerSpeed(prev => prev - 1000);
      setAutoClickerLevel(prev => prev + 1);
      playBuySound();
    }
  }, [points, autoClickerSpeed, playBuySound]);

  const changeBreadIcon = useCallback(() => {
    if (secretPoints >= 3 && !secretButtonUsed) {
      setSecretPoints(prev => prev - 3);
      setBreadIcon(prev => prev === 'bread.png' ? 'bread2.png' : 'bread.png');
      setSecretButtonUsed(true);
      playBuySound();
    }
  }, [secretPoints, secretButtonUsed, playBuySound]);

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

  // Milk animation - only run when not in performance mode
  useEffect(() => {
    // Remove the rotation animation effect
    if (isMilkActive) {
      setMilkRotation(0);
    }
  }, [isMilkActive]);

  const activateMilk = useCallback(() => {
    if (points >= 500 && !isMilkButtonUsed) {
      setPoints(prev => prev - 500);
      setIsMilkActive(true);
      setHasAutoClicker(false);
      setIsMilkButtonUsed(true);
      playBuySound();
    }
  }, [points, isMilkButtonUsed, playBuySound]);

  // Memoize shop buttons to prevent unnecessary re-renders
  const shopButtons = useMemo(() => (
    <div className="shop">
      {!hasAutoClicker ? (
        <button 
          className={`shop-button ${points >= 30 ? 'available' : 'unavailable'}`}
          onClick={buyAutoClicker}
          disabled={isMilkActive}
        >
          Buy Auto Clicker (30 points)
        </button>
      ) : (
        <button 
          className={`shop-button ${points >= 30 ? 'available' : 'unavailable'}`}
          onClick={upgradeAutoClicker}
          disabled={isMilkActive}
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
      <button 
        className={`shop-button milk-button ${isMilkButtonUsed ? 'used' : points >= 500 ? 'available' : 'unavailable'}`}
        onClick={activateMilk}
        disabled={isMilkButtonUsed}
      >
        Invite Milk Friend (500 points)
      </button>
    </div>
  ), [points, hasAutoClicker, autoClickerLevel, autoClickerSpeed, clickPowerLevel, 
      secretPoints, secretButtonUsed, secretButton2Used, isMilkButtonUsed, isMilkActive,
      buyAutoClicker, upgradeAutoClicker, upgradeClickPower, changeBreadIcon, 
      changeToDrink, activateMilk]);

  // Optimize auto clicker
  useEffect(() => {
    if (!hasAutoClicker) return;

    const interval = setInterval(() => {
      clickQueue.current.push(Date.now());
      
      if (!isAnimating.current) {
        isAnimating.current = true;
        setScale(0.9);
        setTimeout(() => {
          setScale(1);
          isAnimating.current = false;
        }, 100);
      }
      playClickSound();
    }, autoClickerSpeed);

    return () => clearInterval(interval);
  }, [hasAutoClicker, autoClickerSpeed, playClickSound]);

  const togglePerformanceMode = useCallback(() => {
    setPerformanceMode(prev => !prev);
  }, []);

  return (
    <div className="App" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <button 
        className={`performance-toggle ${performanceMode ? 'active' : ''}`}
        onClick={togglePerformanceMode}
        title={performanceMode ? "Animations Disabled" : "Animations Enabled"}
      >
        {performanceMode ? "Reduce Lag (Recommended)" : "Normal"}
      </button>
      <div className={`spinning-background ${performanceMode ? 'paused' : ''}`}></div>
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
        <div className="bread-container">
          {isMilkActive && (
            <img 
              src="/milk.png"
              alt="Milk"
              className={`milk-overlay ${performanceMode ? 'no-animation' : ''}`}
              style={{
                transform: performanceMode ? 'translate(-50%, -50%)' : `rotate(${milkRotation}deg)`,
                position: 'absolute',
                width: '150px',
                height: '150px',
                pointerEvents: 'none'
              }}
            />
          )}
          <div 
            className={`bread ${performanceMode ? 'no-animation' : ''}`}
            onClick={handleClick}
            style={{ transform: `scale(${scale})` }}
          >
            <img 
              src={`/${breadIcon}`}
              alt="Bread" 
              className="bread-image"
            />
          </div>
        </div>
        <div className={`shop-toggle ${performanceMode ? 'no-animation' : ''}`} onClick={toggleShop}>
          🛒
        </div>
      </div>
      <div className={`shop-panel ${isShopOpen ? 'open' : ''} ${performanceMode ? 'no-animation' : ''}`}>
        {shopButtons}
      </div>
    </div>
  );
}

export default App;
