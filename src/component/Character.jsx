import React from "react";
import boyImg from "./assets/boy.gif"; // Replace with animated boy image
import girlImg from "./assets/girl.gif"; // Replace with animated girl image

const Character = ({ x, y, hugging }) => {
  return (
    <img
      src={hugging ? girlImg : boyImg}
      alt="Character"
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

export default Character;
