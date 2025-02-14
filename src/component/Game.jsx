import React, { useEffect, useRef, useState } from 'react';

function rectsIntersect(r1, r2) {
  return !(
    r2.x > r1.x + r1.width ||
    r2.x + r2.width < r1.x ||
    r2.y > r1.y + r1.height ||
    r2.y + r2.height < r1.y
  );
}

const GAME_WIDTH = 1000;
const GAME_HEIGHT = 400;
const GROUND_HEIGHT = 80;
const JUMP_SPEED = -28;
const GRAVITY = 1;
const OBSTACLE_SPEED = 3;
const OBSTACLE_SPAWN_RATE = 0.015;
const OBSTACLE_GAP = 500;
const GAME_DURATION = 65000;
const GIRL_APPEAR_TIME = 60000;
const NEXT_LEVEL_URL = "https://snake-game-gray-tau.vercel.app/";

const obstacleEmojis = ["🌳", "🪨", "🚧"];

const Game = () => {
  const groundY = GAME_HEIGHT - GROUND_HEIGHT;

  const characterRef = useRef({
    x: 80,
    y: groundY - 50,
    width: 50,
    height: 50,
    vy: 0,
    onGround: true,
  });

  const obstaclesRef = useRef([]);
  const gameOverRef = useRef(false);
  const gameStartTimeRef = useRef(null);
  const girlRef = useRef(null);

  const [, forceRender] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [hug, setHug] = useState(false);
  const [showGirl, setShowGirl] = useState(false);

  const gameLoopRef = useRef(null);
  const lastTimeRef = useRef(null);

  const jump = () => {
    if (characterRef.current.onGround) {
      characterRef.current.vy = JUMP_SPEED;
      characterRef.current.onGround = false;
    }
  };

  const updateGame = (deltaTime) => {
    if (!gameStartTimeRef.current) {
      gameStartTimeRef.current = Date.now();
    }

    const elapsedTime = Date.now() - gameStartTimeRef.current;

    if (elapsedTime >= GIRL_APPEAR_TIME && !showGirl) {
      setShowGirl(true);
      girlRef.current = {
        x: GAME_WIDTH,
        y: groundY - 50,
        width: 50,
        height: 50,
        emoji: '👧',
      };
    }

    if (elapsedTime >= GAME_DURATION) {
      endGame();
      return;
    }

    characterRef.current.vy += GRAVITY;
    characterRef.current.y += characterRef.current.vy;

    if (characterRef.current.y >= groundY - characterRef.current.height) {
      characterRef.current.y = groundY - characterRef.current.height;
      characterRef.current.vy = 0;
      characterRef.current.onGround = true;
    } else {
      characterRef.current.onGround = false;
    }

    obstaclesRef.current = obstaclesRef.current
      .map(ob => ({ ...ob, x: ob.x - OBSTACLE_SPEED }))
      .filter(ob => ob.x + ob.width > 0);

    if (showGirl && girlRef.current) {
      girlRef.current.x -= OBSTACLE_SPEED;
    }

    if (
      (!obstaclesRef.current.length ||
        obstaclesRef.current[obstaclesRef.current.length - 1].x < GAME_WIDTH - OBSTACLE_GAP) &&
      Math.random() < OBSTACLE_SPAWN_RATE
    ) {
      obstaclesRef.current.push({
        x: GAME_WIDTH,
        y: groundY - 50,
        width: 50,
        height: 50,
        emoji: obstacleEmojis[Math.floor(Math.random() * obstacleEmojis.length)],
      });
    }

    for (let ob of obstaclesRef.current) {
      if (rectsIntersect(characterRef.current, ob)) {
        endGame();
        return;
      }
    }

    if (showGirl && rectsIntersect(characterRef.current, girlRef.current)) {
      setHug(true);
      endGame();
    }

    forceRender(n => n + 1);
  };

  const endGame = () => {
    gameOverRef.current = true;
    setGameOver(true);
    cancelAnimationFrame(gameLoopRef.current);
  };

  const gameLoop = (timestamp) => {
    if (gameOverRef.current) return;
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    updateGame(deltaTime);
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(gameLoopRef.current);
    };
  }, []);

  const handleRestart = () => {
    window.location.reload();
  };

  const handleSkip = () => {
    window.location.href = NEXT_LEVEL_URL;
  };

  return (
    <div
      className="game-container"
      style={{ width: GAME_WIDTH, height: GAME_HEIGHT, border: '2px solid #000', position: 'relative', margin: '20px auto', background: '#f0f0f0' }}
    >
      <div style={{ position: 'absolute', left: 0, top: groundY, width: '100%', height: GROUND_HEIGHT, background: '#654321', zIndex: 1 }}></div>

      <div style={{ position: 'absolute', left: characterRef.current.x, top: characterRef.current.y, fontSize: '50px', zIndex: 2 }}>{hug ? '🤗' : '👦'}</div>

      {obstaclesRef.current.map((ob, index) => (
        <div key={index} style={{ position: 'absolute', left: ob.x, top: ob.y, fontSize: '50px', zIndex: 2 }}>{ob.emoji}</div>
      ))}

      {showGirl && girlRef.current && <div style={{ position: 'absolute', left: girlRef.current.x, top: girlRef.current.y, fontSize: '50px', zIndex: 2 }}>{girlRef.current.emoji}</div>}

      {gameOver && (
        <div style={{ position: 'absolute', top: '40%', left: '40%', textAlign: 'center' }}>
          <div style={{ fontSize: '30px', color: hug ? 'green' : 'red', marginBottom: '10px' }}>{hug ? "You Won! 🎉" : "Game Over!"}</div>
          {!hug && <button onClick={handleRestart}>Restart</button>}
          {hug && <button onClick={handleSkip}>Next</button>}
        </div>
      )}
    </div>
  );
};

export default Game;