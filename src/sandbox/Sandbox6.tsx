import React from "react";
import Sketch from "react-p5";
import p5Types from "p5"; //Import this for typechecking and intellisense
import {
  particles,
  plot,
  applyEnergy,
  T,
  gravity,
  bounce,
  lockPairs,
  drag,
  pairs,
  drawPairs,
  wind,
  curveVertex,
  circularPairs,
} from "./functions6";

interface ComponentProps {
  //Your component props
}

export const Sandbox: React.FC<ComponentProps> = (props: ComponentProps) => {
  //See annotations in JS for more information
  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(window.innerWidth, 800).parent(canvasParentRef);
  };

  const draw = (p5: p5Types) => {
    p5.background(255);

    lockPairs(pairs, particles, T, 4);
    drag(T, 0.92);
    gravity(particles, T, 10);

    wind(T, -1);

    applyEnergy(particles, T);
    bounce(particles, T, window.innerWidth, 800, 0.5);

    // drawPairs(particles, circularPairs(particles, 1, 1), p5);
    // drawPairs(particles, pairs, p5);
    curveVertex(particles, 0, particles.length, p5);
    // plot(particles, p5);
  };

  return <Sketch setup={setup} draw={draw} />;
};
