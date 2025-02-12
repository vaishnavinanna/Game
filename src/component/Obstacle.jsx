import React from "react";
import momImg from "./assets/mom.png"; // Replace with actual images
import dadImg from "./assets/dad.png";
import brotherImg from "./assets/brother.png";
import sisterImg from "./assets/sister.png";

const obstacleImages = { mom: momImg, dad: dadImg, brother: brotherImg, sister: sisterImg };

const Obstacle = ({ x, y, type }) => {
  return (
    <img
      src={obstacleImages[type]}
      alt={type}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: "50px",
        height: "50px",
      }}
    />
  );
};

export default Obstacle;
