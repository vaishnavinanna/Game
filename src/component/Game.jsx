// import React, { useEffect, useRef, useState } from 'react';

// // Helper function to detect collision between two rectangles
// function rectsIntersect(r1, r2) {
//   return !(
//     r2.x > r1.x + r1.width ||
//     r2.x + r2.width < r1.x ||
//     r2.y > r1.y + r1.height ||
//     r2.y + r2.height < r1.y
//   );
// }

// // --------------------------
// // Configuration Parameters
// // --------------------------
// const GAME_WIDTH = 800;            // Width of the game container
// const GAME_HEIGHT = 300;           // Height of the game container
// const GROUND_HEIGHT = 50;          // Height of the ground at the bottom

// // MODIFIED: Increased jump speed from -15 to -20 for a longer (higher) jump.
// const JUMP_SPEED = -25;            // Initial upward velocity when jumping
// const GRAVITY = 0.8;               // Gravity force applied each frame (pulls character down)
// const OBSTACLE_SPEED = 3;          // Speed at which obstacles move left
// const OBSTACLE_SPAWN_RATE = 0.02;  // Probability (per frame update) to spawn an obstacle
// const OBSTACLE_GAP = 200;          // Minimum horizontal gap (in pixels) between obstacles

// // Obstacle emoji choices
// const obstacleEmojis = ["🌳", "🪨", "🚧"];

// const Game = () => {
//   // Derived value for the ground's Y position
//   const groundY = GAME_HEIGHT - GROUND_HEIGHT;

//   // --------------------------
//   // Game State (using refs)
//   // --------------------------
//   const characterRef = useRef({
//     x: 50,
//     y: groundY - 40, // Character height is 40
//     width: 40,
//     height: 40,
//     vy: 0,
//     onGround: true,
//   });
//   const obstaclesRef = useRef([]); // Array to hold obstacles
//   const scoreRef = useRef(0);
//   const gameOverRef = useRef(false);

//   // --------------------------
//   // React States (for rendering)
//   // --------------------------
//   const [, forceRender] = useState(0); // Used to force re-render the component
//   const [gameOver, setGameOver] = useState(false);
//   const [showGirl, setShowGirl] = useState(false);
//   const [hug, setHug] = useState(false);

//   // Refs for the animation loop
//   const gameLoopRef = useRef(null);
//   const lastTimeRef = useRef(null);

//   // --------------------------
//   // Jump Function (triggered on key press)
//   // --------------------------
//   const jump = () => {
//     if (characterRef.current.onGround) {
//       characterRef.current.vy = JUMP_SPEED;
//       characterRef.current.onGround = false;
//     }
//   };

//   // --------------------------
//   // Main Game Update Function
//   // --------------------------
//   const updateGame = (deltaTime) => {
//     // Update character physics (apply gravity and update position)
//     characterRef.current.vy += GRAVITY;
//     characterRef.current.y += characterRef.current.vy;
//     if (characterRef.current.y >= groundY - characterRef.current.height) {
//       characterRef.current.y = groundY - characterRef.current.height;
//       characterRef.current.vy = 0;
//       characterRef.current.onGround = true;
//     } else {
//       characterRef.current.onGround = false;
//     }

//     // Move obstacles to the left and remove those that have left the screen
//     obstaclesRef.current = obstaclesRef.current
//       .map(ob => ({ ...ob, x: ob.x - OBSTACLE_SPEED }))
//       .filter(ob => ob.x + ob.width > 0);

//     // --------------------------
//     // Obstacle Spawning with Gap Control
//     // --------------------------
//     // Only spawn obstacles if the girl hasn't appeared yet.
//     // We check the rightmost obstacle to ensure there's a sufficient gap.
//     const obstaclesOnScreen = obstaclesRef.current.filter(ob => ob.type === 'obstacle');
//     let canSpawnObstacle = true;
//     if (obstaclesOnScreen.length > 0) {
//       const rightmostObstacle = obstaclesOnScreen.reduce((prev, current) => 
//         (prev.x > current.x ? prev : current)
//       );
//       // Ensure the gap between the spawn point and the last obstacle is at least OBSTACLE_GAP
//       if (GAME_WIDTH - rightmostObstacle.x < OBSTACLE_GAP) {
//         canSpawnObstacle = false;
//       }
//     }
//     if (!showGirl && canSpawnObstacle && Math.random() < OBSTACLE_SPAWN_RATE) {
//       obstaclesRef.current.push({
//         x: GAME_WIDTH,
//         y: groundY - 40,
//         width: 40,
//         height: 40,
//         type: 'obstacle',
//         emoji: obstacleEmojis[Math.floor(Math.random() * obstacleEmojis.length)]
//       });
//     }

//     // Increase score over time
//     scoreRef.current += deltaTime * 0.01;
//     if (scoreRef.current > 100 && !showGirl) {
//       setShowGirl(true);
//     }

//     // Once score threshold is reached, add the girl emoji at the end
//     const girlObstacle = obstaclesRef.current.find(ob => ob.type === 'girl');
//     if (showGirl && !girlObstacle) {
//       obstaclesRef.current.push({
//         x: GAME_WIDTH,
//         y: groundY - 40,
//         width: 40,
//         height: 40,
//         type: 'girl',
//         emoji: '👧'
//       });
//     }

//     // Check for collisions between the character and any obstacle
//     for (let ob of obstaclesRef.current) {
//       if (rectsIntersect(characterRef.current, ob)) {
//         if (ob.type === 'girl') {
//           // Collision with the girl triggers a successful hug
//           setHug(true);
//           gameOverRef.current = true;
//           setGameOver(true);
//         } else {
//           // Collision with any other obstacle ends the game
//           gameOverRef.current = true;
//           setGameOver(true);
//         }
//       }
//     }

//     // Force a re-render to update the positions on screen
//     forceRender(n => n + 1);
//   };

//   // --------------------------
//   // Game Loop using requestAnimationFrame
//   // --------------------------
//   const gameLoop = (timestamp) => {
//     if (gameOverRef.current) return;
//     if (!lastTimeRef.current) lastTimeRef.current = timestamp;
//     const deltaTime = timestamp - lastTimeRef.current;
//     lastTimeRef.current = timestamp;

//     updateGame(deltaTime);
//     gameLoopRef.current = requestAnimationFrame(gameLoop);
//   };

//   // --------------------------
//   // Start the Game Loop and Listen for Key Presses
//   // --------------------------
//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (e.code === 'Space' || e.code === 'ArrowUp') {
//         jump();
//       }
//     };
//     window.addEventListener('keydown', handleKeyDown);

//     // Start the game loop
//     gameLoopRef.current = requestAnimationFrame(gameLoop);

//     return () => {
//       window.removeEventListener('keydown', handleKeyDown);
//       cancelAnimationFrame(gameLoopRef.current);
//     };
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [showGirl]);

//   // --------------------------
//   // Render the Game UI
//   // --------------------------
//   return (
//     <div
//       className="game-container"
//       style={{
//         width: GAME_WIDTH,
//         height: GAME_HEIGHT,
//         border: '2px solid #000',
//         position: 'relative',
//         margin: '20px auto',
//         background: '#f0f0f0',
//       }}
//     >
//       {/* Ground */}
//       <div
//         style={{
//           position: 'absolute',
//           left: 0,
//           top: groundY,
//           width: '100%',
//           height: GROUND_HEIGHT,
//           background: '#654321',
//         }}
//       ></div>

//       {/* Character (Boy emoji) */}
//       <div
//         style={{
//           position: 'absolute',
//           left: characterRef.current.x,
//           top: characterRef.current.y,
//           width: characterRef.current.width,
//           height: characterRef.current.height,
//           fontSize: '40px',
//           textAlign: 'center',
//           lineHeight: '40px',
//         }}
//       >
//         {hug ? '🤗' : '👦'}
//       </div>

//       {/* Obstacles and Girl */}
//       {obstaclesRef.current.map((ob, index) => (
//         <div
//           key={index}
//           style={{
//             position: 'absolute',
//             left: ob.x,
//             top: ob.y,
//             width: ob.width,
//             height: ob.height,
//             fontSize: '40px',
//             textAlign: 'center',
//             lineHeight: '40px',
//           }}
//         >
//           {ob.emoji}
//         </div>
//       ))}

//       {/* Score Display */}
//       <div
//         style={{
//           position: 'absolute',
//           top: 10,
//           left: 10,
//           fontSize: '20px',
//           fontWeight: 'bold',
//         }}
//       >
//         Score: {Math.floor(scoreRef.current)}
//       </div>

//       {/* Game Over and Hug Success Messages */}
//       {gameOver && !hug && (
//         <div
//           style={{
//             position: 'absolute',
//             top: '40%',
//             left: '35%',
//             fontSize: '30px',
//             color: 'red',
//           }}
//         >
//           Game Over!
//         </div>
//       )}
//       {hug && (
//         <div
//           style={{
//             position: 'absolute',
//             top: '40%',
//             left: '30%',
//             fontSize: '30px',
//             color: 'blue',
//           }}
//         >
//           🤗 Hug Success! 🤗
//         </div>
//       )}
//     </div>
//   );
// };

// export default Game;


import React, { useEffect, useRef, useState } from "react";
import Character from "./Character";
import Obstacle from "./Obstacle";
import SoundEffects from "./SoundEffects";

const GAME_WIDTH = 800;
const GAME_HEIGHT = 300;
const GROUND_HEIGHT = 50;
const JUMP_SPEED = -25;
const GRAVITY = 0.8;
const OBSTACLE_SPEED = 3;
const OBSTACLE_SPAWN_RATE = 0.02;
const OBSTACLE_TYPES = ["mom", "dad", "brother", "sister"];

const Game = () => {
  const groundY = GAME_HEIGHT - GROUND_HEIGHT;
  const characterRef = useRef({ x: 50, y: groundY - 50, vy: 0, onGround: true });
  const obstaclesRef = useRef([]);
  const scoreRef = useRef(0);
  const gameOverRef = useRef(false);
  const [gameOver, setGameOver] = useState(false);
  const [showGirl, setShowGirl] = useState(false);
  const [hugging, setHugging] = useState(false);
  const [, forceRender] = useState(0);

  const jump = () => {
    if (characterRef.current.onGround) {
      characterRef.current.vy = JUMP_SPEED;
      characterRef.current.onGround = false;
      SoundEffects.playJump();
    }
  };

  const updateGame = (deltaTime) => {
    characterRef.current.vy += GRAVITY;
    characterRef.current.y += characterRef.current.vy;
    if (characterRef.current.y >= groundY - 50) {
      characterRef.current.y = groundY - 50;
      characterRef.current.vy = 0;
      characterRef.current.onGround = true;
    }

    obstaclesRef.current = obstaclesRef.current
      .map(ob => ({ ...ob, x: ob.x - OBSTACLE_SPEED }))
      .filter(ob => ob.x + 50 > 0);

    if (!showGirl && Math.random() < OBSTACLE_SPAWN_RATE) {
      obstaclesRef.current.push({
        x: GAME_WIDTH,
        y: groundY - 50,
        type: OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)],
      });
    }

    scoreRef.current += deltaTime * 0.01;
    if (scoreRef.current > 100 && !showGirl) {
      setShowGirl(true);
    }

    if (showGirl && !obstaclesRef.current.find(ob => ob.type === "girl")) {
      obstaclesRef.current.push({
        x: GAME_WIDTH,
        y: groundY - 50,
        type: "girl",
      });
    }

    for (let ob of obstaclesRef.current) {
      if (rectsIntersect(characterRef.current, { x: ob.x, y: ob.y, width: 50, height: 50 })) {
        if (ob.type === "girl") {
          setHugging(true);
          SoundEffects.playHug();
          gameOverRef.current = true;
          setGameOver(true);
        } else {
          SoundEffects.playYay();
          obstaclesRef.current = obstaclesRef.current.filter(o => o !== ob);
        }
      }
    }

    forceRender(n => n + 1);
  };

  const gameLoop = (timestamp) => {
    if (gameOverRef.current) return;
    const deltaTime = timestamp - (gameLoop.lastTime || timestamp);
    gameLoop.lastTime = timestamp;
    updateGame(deltaTime);
    requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      if (e.code === "Space" || e.code === "ArrowUp") jump();
    });
    requestAnimationFrame(gameLoop);
    return () => window.removeEventListener("keydown", jump);
  }, []);

  return (
    <div style={{ width: GAME_WIDTH, height: GAME_HEIGHT, border: "2px solid black", position: "relative", background: "#f0f0f0" }}>
      <div style={{ position: "absolute", left: 0, top: groundY, width: "100%", height: GROUND_HEIGHT, background: "#654321" }}></div>
      <Character x={characterRef.current.x} y={characterRef.current.y} hugging={hugging} />
      {obstaclesRef.current.map((ob, index) => (
        <Obstacle key={index} x={ob.x} y={ob.y} type={ob.type} />
      ))}
      <div style={{ position: "absolute", top: 10, left: 10, fontSize: "20px", fontWeight: "bold" }}>Score: {Math.floor(scoreRef.current)}</div>
      {gameOver && hugging && <div style={{ position: "absolute", top: "40%", left: "30%", fontSize: "30px", color: "blue" }}>🤗 Hug Success! 🤗</div>}
    </div>
  );
};

function rectsIntersect(r1, r2) {
  return !(r2.x > r1.x + 50 || r2.x + 50 < r1.x || r2.y > r1.y + 50 || r2.y + 50 < r1.y);
}

export default Game;
