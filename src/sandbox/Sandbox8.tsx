import React from "react";
import Sketch from "react-p5";
import p5Types from "p5"; //Import this for typechecking and intellisense
import {
  particle,
  pair,
  circularParticles,
  plot,
  applyEnergy,
  gravity,
  bounce,
  lockPairs,
  drag,
  drawPairs,
  wind,
  initEnergy,
  curveVertex,
  circularPairs,
  createFace,
  changeRest,
  centralizedPairs,
  rangeToIndexArray,
  angledEllipse,
  p2p,
} from "./functions8";

interface ComponentProps {
  //Your component props
}

export const Sandbox: React.FC<ComponentProps> = (props: ComponentProps) => {
  //See annotations in JS for more information
  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(window.innerWidth, 800).parent(canvasParentRef);
  };

  const ox = 500;
  const oy = 150;
  // Init with outer Shell
  const s_c = 64; // shell node count
  const shellRadius = 120;
  const shellMass = 10;
  var particles: particle[] = circularParticles(
    s_c,
    shellRadius,
    ox,
    oy,
    shellMass
  );

  //face =========================
  const eyeIndex1 = 37;
  const eyeIndex2 = 59;
  const eyeRadius = 10;
  const eyeMass = 10;

  const face: particle[] = createFace(
    particles,
    eyeIndex1,
    eyeIndex2,
    eyeRadius,
    eyeMass
  );
  const re1 = s_c + 0; // left eye index
  const le1 = s_c + 1;

  const re2 = s_c + 2; // left eye index
  const le2 = s_c + 3;

  const re3 = s_c + 4; // left eye index
  const le3 = s_c + 5;
  particles = [...particles, ...face];
  const fs = 0.4; // face strength
  var fp = 8; // face split to shell

  //end face ====================

  var pairs: pair[] = [
    ...circularPairs(particles, 0, s_c, 1, 1, "M"),
    ...circularPairs(particles, 0, s_c, 2, 1, "M"),
    ...circularPairs(particles, 0, s_c, 4, 1, "M"),
    ...circularPairs(particles, 0, s_c, 8, 0.8, "M"),
    ...circularPairs(particles, 0, s_c, 16, 0.5, "M"),
    ...circularPairs(particles, 0, s_c, 32, 0.3, "M"), // 6 x 64 shell res
    // face corners
    ...centralizedPairs(particles, le1, rangeToIndexArray(0, s_c, fp), fs, "O"), //eye corner left    1
    ...centralizedPairs(particles, re1, rangeToIndexArray(0, s_c, fp), fs, "O"), //eye corner right   1
    ...centralizedPairs(particles, le2, rangeToIndexArray(0, s_c, fp), fs, "O"), //mouth corner left   2
    ...centralizedPairs(particles, re2, rangeToIndexArray(0, s_c, fp), fs, "O"), // mouth conrner right   2
    ...centralizedPairs(particles, le3, rangeToIndexArray(0, s_c, fp), fs, "O"), //eye corner left   3
    ...centralizedPairs(particles, re3, rangeToIndexArray(0, s_c, fp), fs, "O"), // eye right corner    3
    ...[p2p(particles, le1, re1, 3, "M")],
    ...[p2p(particles, le2, re2, 3, "M")],
    ...[p2p(particles, le3, re3, 3, "M")],
    ...[p2p(particles, re1, le2, 3, "M")],
    ...[p2p(particles, re2, le3, 3, "M")],
  ];

  const T = initEnergy(particles); // kinetic Energy For each particle

  var t = 0;
  var windActive = false;

  var openEyes = false;
  var eyesH = 0.1;
  const draw = (p5: p5Types) => {
    t++;
    p5.background(255, 255, 255, 235);
    // controls
    // changeRest(pairs, 384, 384 + eye_c, Math.sin(t * 0.05));

    //Physics

    lockPairs(pairs, particles, T, 4);

    drag(T, 0.925);
    gravity(particles, T, 12);
    if (t < 100) {
      wind(T, 25);
    } else {
      // wind(T, 0.5);
    }
    // wind(T, 5);
    if (t > 500) {
      eyesH = 23;
    }

    applyEnergy(particles, T);
    bounce(particles, T, window.innerWidth, 800, 0.2);

    //Visual
    // drawPairs(particles, circularPairs(particles, 1, 1), p5);
    // drawPairs(particles, pairs.slice(pairs.length - 24, pairs.length), p5);

    angledEllipse(particles[le1], particles[re1], eyesH, p5);
    angledEllipse(particles[le2], particles[re2], 0.2, p5);
    angledEllipse(particles[le3], particles[re3], eyesH, p5);

    // draw shellPair
    curveVertex(particles, 0, s_c, 4, p5);
    // draw face

    // plot(particles, p5);
  };

  return <Sketch setup={setup} draw={draw} />;
};
