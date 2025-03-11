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
  const [isCroissantButtonUsed, setIsCroissantButtonUsed] = useState(false);
  const [isCarActive, setIsCarActive] = useState(false);
  const [isBagelButtonUsed, setIsBagelButtonUsed] = useState(false);
  const [isBagelActive, setIsBagelActive] = useState(false);
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
  const isAnimating = useRef(false);
  const lastSoundTime = useRef(0);
  const SOUND_THROTTLE = 1000; // Increase sound throttle to reduce lag
  const pointsRef = useRef(points);
  const secretPointsRef = useRef(secretPoints);
  const nextThresholdRef = useRef(nextSecretThreshold);
  const lastClickTime = useRef(0);
  const MIN_CLICK_INTERVAL = 50; // Minimum time between clicks

  // Keep refs in sync with state
  useEffect(() => {
    pointsRef.current = points;
  }, [points]);

  useEffect(() => {
    secretPointsRef.current = secretPoints;
    nextThresholdRef.current = nextSecretThreshold;
  }, [secretPoints, nextSecretThreshold]);

  // Ultra optimized click handler
  const handleClick = useCallback((e) => {
    // Prevent default to stop any browser handling
    e.preventDefault();
    e.stopPropagation();

    const now = Date.now();
    if (now - lastClickTime.current < MIN_CLICK_INTERVAL) {
      return; // Skip if clicking too fast
    }
    lastClickTime.current = now;

    // Update points using ref for immediate feedback
    pointsRef.current += clickPower;
    
    // Batch state updates in next animation frame
    requestAnimationFrame(() => {
      setPoints(pointsRef.current);

      // Check for secret points
      if (pointsRef.current >= nextThresholdRef.current) {
        const secretPointsToAdd = Math.floor((pointsRef.current - nextThresholdRef.current) / 50) + 1;
        const newSecretPoints = secretPointsRef.current + secretPointsToAdd;
        const newThreshold = nextThresholdRef.current + (secretPointsToAdd * 50);
        
        secretPointsRef.current = newSecretPoints;
        nextThresholdRef.current = newThreshold;
        
        setSecretPoints(newSecretPoints);
        setNextSecretThreshold(newThreshold);
      }
    });

    // Ultra minimal sound
    if (now - lastSoundTime.current > SOUND_THROTTLE) {
      lastSoundTime.current = now;
      setTimeout(playClickSound, 0); // Defer sound to next tick
    }
    
    // Super minimal animation only in normal mode
    if (!performanceMode && !isAnimating.current) {
      isAnimating.current = true;
      setScale(0.99); // Smaller scale change
      setTimeout(() => {
        setScale(1);
        isAnimating.current = false;
      }, 16);
    }
  }, [clickPower, performanceMode, playClickSound]);

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

  const activateCroissant = useCallback(() => {
    if (points >= 600 && !isCroissantButtonUsed) {
      setPoints(prev => prev - 600);
      setIsCroissantButtonUsed(true);
      setIsCarActive(true);
      playBuySound();
    }
  }, [points, isCroissantButtonUsed, playBuySound]);

  const activateBagel = useCallback(() => {
    if (points >= 750 && !isBagelButtonUsed) {
      setPoints(prev => prev - 750);
      setIsBagelButtonUsed(true);
      setIsBagelActive(true);
      playBuySound();
    }
  }, [points, isBagelButtonUsed, playBuySound]);

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
      <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
        <button 
          className={`shop-button milk-button ${isMilkButtonUsed ? 'used' : points >= 500 ? 'available' : 'unavailable'}`}
          onClick={activateMilk}
          disabled={isMilkButtonUsed}
          style={{ flex: 1 }}
        >
          Invite Milk Friend (500 points)
        </button>
        <button 
          className={`shop-button milk-button ${isCroissantButtonUsed ? 'used' : points >= 600 ? 'available' : 'unavailable'}`}
          onClick={activateCroissant}
          disabled={isCroissantButtonUsed}
          style={{ flex: 1 }}
        >
          Invite Croissant Friend (600 points)
        </button>
      </div>
      <button 
        className={`shop-button milk-button ${isBagelButtonUsed ? 'used' : points >= 750 ? 'available' : 'unavailable'}`}
        onClick={activateBagel}
        disabled={isBagelButtonUsed}
      >
        Invite Bagel Friend (750 points)
      </button>
    </div>
  ), [points, hasAutoClicker, autoClickerLevel, autoClickerSpeed, clickPowerLevel, 
      secretPoints, secretButtonUsed, secretButton2Used, isMilkButtonUsed, isCroissantButtonUsed, isBagelButtonUsed, isMilkActive,
      buyAutoClicker, upgradeAutoClicker, upgradeClickPower, changeBreadIcon, 
      changeToDrink, activateMilk, activateCroissant, activateBagel]);

  // Optimize auto clicker
  useEffect(() => {
    if (!hasAutoClicker) return;

    let lastAutoClick = Date.now();
    let intervalId;

    // Use setInterval for consistent auto clicking
    intervalId = setInterval(() => {
      const now = Date.now();
      
      // Direct point update with ref
      pointsRef.current += clickPower;
      
      // Batch state updates
      requestAnimationFrame(() => {
        setPoints(pointsRef.current);

        if (pointsRef.current >= nextThresholdRef.current) {
          const secretPointsToAdd = Math.floor((pointsRef.current - nextThresholdRef.current) / 50) + 1;
          const newSecretPoints = secretPointsRef.current + secretPointsToAdd;
          const newThreshold = nextThresholdRef.current + (secretPointsToAdd * 50);
          
          secretPointsRef.current = newSecretPoints;
          nextThresholdRef.current = newThreshold;
          
          setSecretPoints(newSecretPoints);
          setNextSecretThreshold(newThreshold);
        }
      });

      // Minimal sound
      if (now - lastSoundTime.current > SOUND_THROTTLE) {
        lastSoundTime.current = now;
        setTimeout(playClickSound, 0);
      }

      // Super minimal animation
      if (!performanceMode && !isAnimating.current) {
        isAnimating.current = true;
        setScale(0.99);
        setTimeout(() => {
          setScale(1);
          isAnimating.current = false;
        }, 16);
      }
    }, autoClickerSpeed);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [hasAutoClicker, autoClickerSpeed, clickPower, performanceMode, playClickSound]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (lastSoundTime.current) {
        clearTimeout(lastSoundTime.current);
      }
    };
  }, []);

  const togglePerformanceMode = useCallback(() => {
    setPerformanceMode(prev => !prev);
  }, []);

  // Optimize bread container with better memoization
  const breadContainerStyle = useMemo(() => ({
    transform: performanceMode ? 'none' : `scale(${scale})`
  }), [scale, performanceMode]);

  // Memoize bread container with aggressive optimization
  const breadContainer = useMemo(() => (
    <div className="bread-container">
      {isMilkActive && (
        <img 
          src="/milk.png"
          alt="Milk"
          className={`milk-overlay ${performanceMode ? 'no-animation' : ''}`}
          style={{
            transform: 'translate(-50%, -50%)',
            position: 'absolute',
            width: '150px',
            height: '150px',
            pointerEvents: 'none'
          }}
        />
      )}
      {isCarActive && (
        <img 
          src="/car.png"
          alt="Car"
          className={`milk-overlay ${performanceMode ? 'no-animation' : ''}`}
          style={{
            transform: 'translate(-50%, -50%)',
            position: 'absolute',
            width: '150px',
            height: '150px',
            pointerEvents: 'none',
            left: '75%'
          }}
        />
      )}
      {isBagelActive && (
        <img 
          src="/Bagele1.png"
          alt="Bagel"
          className={`milk-overlay ${performanceMode ? 'no-animation' : ''}`}
          style={{
            transform: 'translate(-50%, -50%)',
            position: 'absolute',
            width: '150px',
            height: '150px',
            pointerEvents: 'none',
            left: '150%'
          }}
        />
      )}
      <div 
        className={`bread ${performanceMode ? 'no-animation' : ''}`}
        onMouseDown={handleClick}
        style={breadContainerStyle}
      >
        <img 
          src={`/${breadIcon}`}
          alt="Bread" 
          className="bread-image"
          draggable={false}
        />
      </div>
    </div>
  ), [isMilkActive, performanceMode, isCarActive, isBagelActive, handleClick, breadContainerStyle, breadIcon]);

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
        {breadContainer}
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