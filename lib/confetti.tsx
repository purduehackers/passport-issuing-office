"use client"

import React, { useRef, useEffect } from "react";
//import { createRoot } from "react-dom";
import ReactCanvasConfetti from "react-canvas-confetti";

const commonOptions = {
  spread: 180,
  ticks: 240,
  gravity: 1,
  decay: 0.9,
  startVelocity: 85,
  //colors: ["FFE400", "FFBD00", "E89400", "FFCA6C", "FDFFB8"],
  colors: ["FCD34D", "FFFFFF"],
  particleCount: 300,
  shapes: ["square", "circle"],
  angle: 90,
  origin: {
    x: .5,
    y: 1.25,
  },
};

function LaunchConfetti() {
  const instance = useRef();

  const onInit = ({ confetti }) => {
    instance.current = confetti;
  };

  const fire = () => {
    instance.current({
          ...commonOptions
    });
  };

  useEffect(() => {
    fire();
  }, []);

  return (
    <>
      <ReactCanvasConfetti onInit={onInit} />
    </>
  );
}

export default LaunchConfetti;