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
} from "./functions5";
interface ComponentProps {
  //Your component props
}

export const Sandbox: React.FC<ComponentProps> = (props: ComponentProps) => {
  //See annotations in JS for more information
  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(1000, 700).parent(canvasParentRef);
  };

  const draw = (p5: p5Types) => {
    p5.background(0);

    lockPairs(pairs, particles, T, 4);
    drag(T, 0.92);
    gravity(particles, T, 12);
    // wind(T, 20.2);
    applyEnergy(particles, T);
    bounce(particles, T, 1000, 700, 1);
    drawPairs(particles, pairs, p5);
    plot(particles, p5);
  };

  return <Sketch setup={setup} draw={draw} />;
};
