import React, { useEffect, useRef, useState } from 'react';
import Button from '@mui/material/Button';
import '../App.css';

// Helper function to detect collision between two rectangles
function rectsIntersect(r1, r2) {
  return !(
    r2.x > r1.x + r1.width ||
    r2.x + r2.width < r1.x ||
    r2.y > r1.y + r1.height ||
    r2.y + r2.height < r1.y
  );
}

const GAME_WIDTH = 800;
const GAME_HEIGHT = 300;
const GROUND_HEIGHT = 50;
const JUMP_SPEED = -20;
const GRAVITY = 0.8;
const OBSTACLE_SPEED = 3;
const OBSTACLE_SPAWN_RATE = 0.02;
const OBSTACLE_GAP = 150;
const NEXT_LEVEL_URL = "https://snake-game-gray-tau.vercel.app/";

const obstacleEmojis = ["🌳", "🪨", "🚧"];

const Game = () => {
  const groundY = GAME_HEIGHT - GROUND_HEIGHT;
  const characterRef = useRef({ x: 50, y: groundY - 40, width: 40, height: 40, vy: 0, onGround: true });
  const obstaclesRef = useRef([]);
  const scoreRef = useRef(0);
  const gameOverRef = useRef(false);

  const [, forceRender] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showGirl, setShowGirl] = useState(false);
  const [hug, setHug] = useState(false);

  const gameLoopRef = useRef(null);
  const lastTimeRef = useRef(null);

  const jump = () => {
    if (characterRef.current.onGround) {
      characterRef.current.vy = JUMP_SPEED;
      characterRef.current.onGround = false;
    }
  };

  const updateGame = (deltaTime) => {
    characterRef.current.vy += GRAVITY;
    characterRef.current.y += characterRef.current.vy;
    if (characterRef.current.y >= groundY - characterRef.current.height) {
      characterRef.current.y = groundY - characterRef.current.height;
      characterRef.current.vy = 0;
      characterRef.current.onGround = true;
    }

    obstaclesRef.current = obstaclesRef.current.map(ob => ({ ...ob, x: ob.x - OBSTACLE_SPEED })).filter(ob => ob.x + ob.width > 0);

    const obstaclesOnScreen = obstaclesRef.current.filter(ob => ob.type === 'obstacle');
    let canSpawnObstacle = true;
    if (obstaclesOnScreen.length > 0) {
      const rightmostObstacle = obstaclesOnScreen.reduce((prev, current) => (prev.x > current.x ? prev : current));
      if (GAME_WIDTH - rightmostObstacle.x < OBSTACLE_GAP) {
        canSpawnObstacle = false;
      }
    }
    if (!showGirl && canSpawnObstacle && Math.random() < OBSTACLE_SPAWN_RATE) {
      obstaclesRef.current.push({ x: GAME_WIDTH, y: groundY - 40, width: 40, height: 40, type: 'obstacle', emoji: obstacleEmojis[Math.floor(Math.random() * obstacleEmojis.length)] });
    }

    scoreRef.current += deltaTime * 0.01;
    if (scoreRef.current > 100 && !showGirl) {
      setShowGirl(true);
    }

    const girlObstacle = obstaclesRef.current.find(ob => ob.type === 'girl');
    if (showGirl && !girlObstacle) {
      obstaclesRef.current.push({ x: GAME_WIDTH, y: groundY - 40, width: 40, height: 40, type: 'girl', emoji: '👧' });
    }

    for (let ob of obstaclesRef.current) {
      if (rectsIntersect(characterRef.current, ob)) {
        if (ob.type === 'girl') {
          setHug(true);
          gameOverRef.current = true;
          setGameOver(true);
        } else {
          gameOverRef.current = true;
          setGameOver(true);
        }
      }
    }

    forceRender(n => n + 1);
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
  }, [showGirl]);

  return (
    <div className="game-container" style={{ width: GAME_WIDTH, height: GAME_HEIGHT, border: '2px solid #000', position: 'relative', margin: '20px auto', background: '#f0f0f0' }}>
      <div style={{ position: 'absolute', left: 0, top: groundY, width: '100%', height: GROUND_HEIGHT, background: '#654321' }}></div>
      <div style={{ position: 'absolute', left: characterRef.current.x, top: characterRef.current.y, width: characterRef.current.width, height: characterRef.current.height, fontSize: '40px', textAlign: 'center', lineHeight: '40px' }}>{hug ? '🤗' : '👦'}</div>
      {obstaclesRef.current.map((ob, index) => (
        <div key={index} style={{ position: 'absolute', left: ob.x, top: ob.y, width: ob.width, height: ob.height, fontSize: '40px', textAlign: 'center', lineHeight: '40px' }}>{ob.emoji}</div>
      ))}
      <div style={{ position: 'absolute', top: 10, left: 10, fontSize: '20px', fontWeight: 'bold' }}>Score: {Math.floor(scoreRef.current)}</div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
      {/* {gameOver && !hug && (
        <h1>Game Over</h1>,
        <Button variant="contained" color="secondary" style={{ margin: '70px 10px' }} onClick={() => window.location.reload()}>
        Restart
      </Button>,
        <Button variant="contained" color="secondary" style={{ margin: '70px 10px' }} onClick={() => window.location.href = NEXT_LEVEL_URL}>
          Skip
        </Button>
      )}
      {hug && (
        <h1>Hurrey ! You Win</h1>,
        <Button variant="contained" color="primary" style={{ margin: '70px 10px' }} onClick={() => window.location.href = NEXT_LEVEL_URL}>
          Next
        </Button>
      )} */}
      {gameOver && !hug && (
  <div style={{ textAlign: 'center' }}>
    <h1>Game Over</h1>
    <Button variant="contained" color="secondary" style={{ margin: '10px 10px' }} onClick={() => window.location.reload()}>
      Restart
    </Button>
    <Button variant="contained" color="secondary" style={{ margin: '10px 10px' }} onClick={() => window.location.href = NEXT_LEVEL_URL}>
      Skip
    </Button>
  </div>
)}

{hug && (
  <div style={{ textAlign: 'center' }}>
    <h1>Hurrey! You Win</h1>
    <Button variant="contained" color="primary" style={{ margin: '10px 10px' }} onClick={() => window.location.href = NEXT_LEVEL_URL}>
      Next
    </Button>
  </div>
)}

    </div>
    </div>
  );
};

export default Game;
