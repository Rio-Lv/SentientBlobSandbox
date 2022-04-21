import { create } from "domain";
import p5Types from "p5";

export type particle = {
  mass: number;
  x: number;
  y: number;
  Ex: number; // Kinetic Energy
  Ey: number;
};

export type energy = {
  x: number;
  y: number;
};
export type pair = {
  a: number;
  b: number;
  rest: number;
  strength: number; // pair strength
  type: string; // M mutual of O one sided where a take prio
};

export const initEnergy = (particles: particle[]): energy[] => {
  const T: energy[] = [];
  for (let i = 0; i < particles.length; i++) {
    T.push({ x: particles[i].Ex, y: particles[i].Ey });
  }
  return T;
};

export const applyEnergy = (particles: particle[], T: energy[]) => {
  for (let i = 0; i < particles.length; i++) {
    let P = particles[i];
    const k = 0.1;
    P.x += (T[i].x * k) / P.mass;
    P.y += (T[i].y * k) / P.mass;
  }
};
export const gravity = (particles: particle[], T: energy[], G: number) => {
  for (let i = 0; i < T.length; i++) {
    T[i].y += G * particles[i].mass;
  }
};

export const wind = (T: energy[], W: number) => {
  for (let i = 0; i < T.length; i++) {
    T[i].x += W;
  }
};

export const bounce = (
  particles: particle[],
  T: energy[],
  w: number,
  h: number,
  loss: number //energy loss ratio
) => {
  const friction = 0.4;
  const d = 3;
  for (let i = 0; i < particles.length; i++) {
    if (particles[i].x >= w - d) {
      T[i].x *= -loss;
      T[i].y *= friction;
      particles[i].x = w - d;
    }
    if (particles[i].x <= d) {
      T[i].x *= -loss;
      T[i].y *= friction;
      particles[i].x = d;
    }
    if (particles[i].y >= h - d) {
      T[i].y *= -loss;
      T[i].x *= friction;
      particles[i].y = h - d;
    }
    if (particles[i].y <= d) {
      T[i].y *= -loss;
      T[i].x *= friction;
      particles[i].y = d;
    }
  }
};
const lock = (
  pair: pair,
  particles: particle[],
  T: energy[],
  D: number // damp
) => {
  const dx = particles[pair.b].x - particles[pair.a].x;
  const dy = particles[pair.b].y - particles[pair.a].y;
  const d = Math.sqrt(dx ** 2 + dy ** 2);

  const delta = (d - pair.rest) * pair.strength;
  const Tx = (dx / d) * delta;
  const Ty = (dy / d) * delta;
  if (pair.type === "M") {
    T[pair.a].x += Tx * D;
    T[pair.a].y += Ty * D;
    T[pair.b].x -= Tx * D;
    T[pair.b].y -= Ty * D;
  } else if (pair.type === "O") {
    T[pair.a].x += Tx * D;
    T[pair.a].y += Ty * D;
  }
};

export const lockPairs = (
  pairs: pair[],
  particles: particle[],
  T: energy[],
  D: number
) => {
  for (let i = 0; i < pairs.length; i++) {
    lock(pairs[i], particles, T, D);
  }
};

export const drag = (T: energy[], D: number) => {
  for (let i = 0; i < T.length; i++) {
    T[i].x *= D;
    T[i].y *= D;
  }
};

export const plot = (particles: particle[], p5: p5Types) => {
  for (let i = 0; i < particles.length; i++) {
    p5.fill(0);
    if (false) {
      p5.stroke(255, 0, 0);
    } else {
      p5.stroke(0);
    }
    p5.circle(particles[i].x, particles[i].y, 1);
  }
};

export const drawPairs = (
  particles: particle[],
  pairs: pair[],
  p5: p5Types
) => {
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    p5.stroke(120);
    p5.strokeWeight(1);
    p5.line(
      particles[pair.a].x,
      particles[pair.a].y,
      particles[pair.b].x,
      particles[pair.b].y
    );
  }
};

export const circularParticles = (
  numParticles: number,
  radius: number,
  offsetX: number,
  offsetY: number,
  mass: number
): particle[] => {
  const particles: particle[] = [];
  const shellAngle = (Math.PI * 2) / numParticles;
  const shellRadius = radius;
  const getY = (index: number) => {
    return Math.sin(index * shellAngle) * shellRadius;
  };
  const getX = (index: number) => {
    return Math.cos(index * shellAngle) * shellRadius;
  };
  for (let i = 0; i < numParticles; i++) {
    particles.push({
      mass: mass,
      x: getX(i) + offsetX,
      y: getY(i) + offsetY,
      Ex: 0,
      Ey: 100,
    });
  }
  return particles;
};
/** @params {} */
export const circularPairs = (
  particles: particle[],
  index1: number,
  index2: number,
  offset: number,
  strength: number,
  type: string
): pair[] => {
  const pairs: pair[] = [];
  for (let i = index1; i < index2; i++) {
    if (i < index2 - offset) {
      const a = i;
      const b = i + offset;
      const dx = particles[b].x - particles[a].x;
      const dy = particles[b].y - particles[a].y;
      const rest = Math.sqrt(dx * dx + dy * dy);
      pairs.push({ a, b, rest, strength, type });
    } else {
      const a = i;
      const b = i - index2 + offset + index1;
      const dx = particles[b].x - particles[a].x;
      const dy = particles[b].y - particles[a].y;
      const rest = Math.sqrt(dx * dx + dy * dy);
      pairs.push({ a, b, rest, strength, type });
    }
  }
  return pairs;
};

export const centralizedPairs = (
  particles: particle[],
  index: number, // central particle index
  NIndex: number[], // connected indices
  strength: number,
  type: string
): pair[] => {
  const pairs: pair[] = [];
  const a = index;
  for (let i = 0; i < NIndex.length; i++) {
    const b = NIndex[i];
    const dx = particles[a].x - particles[NIndex[i]].x;
    const dy = particles[a].y - particles[NIndex[i]].y;
    const rest = Math.sqrt(dx * dx + dy * dy);
    pairs.push({ a, b, rest, strength, type });
  }
  return pairs;
};

export const rangeToIndexArray = (
  index1: number,
  index2: number,
  split: number
): number[] => {
  const indices: number[] = [];
  for (let i = index1; i < index2; i += split) {
    indices.push(i);
  }
  return indices;
};
export const curveVertex = (
  particles: particle[],
  index1: number,
  index2: number,
  skip: number,
  p5: p5Types
) => {
  p5.noFill();
  // p5.fill(255);
  p5.stroke(0);
  p5.strokeWeight(3);
  p5.curveTightness(0);

  const d = skip;
  p5.beginShape();
  p5.curveVertex(particles[index2 - d].x, particles[index2 - d].y);
  for (let i = index1; i < index2; i += d) {
    p5.curveVertex(particles[i].x, particles[i].y);
  }
  p5.curveVertex(particles[index1].x, particles[index1].y);
  p5.curveVertex(particles[index1 + d].x, particles[index1 + d].y);

  p5.endShape();
};

// Alert ===========================================================================
// Dealing with the face Now
export type pos = {
  x: number;
  y: number;
};

// need to create a face
export const createFace = (
  particles: particle[],
  index1: number,
  index2: number,
  radius: number,
  mass: number
): particle[] => {
  var face: particle[] = [];
  // draw a line between the indexed particles and add feature init positions
  const ratio1 = 1 / 3;
  const ratio2 = 1 / 2;
  const ratio3 = 1 - ratio1;

  const x1 = particles[index1].x;
  const y1 = particles[index1].y;
  const x2 = particles[index2].x;
  const y2 = particles[index2].y;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const eye1Pos: pos = { x: x1 + dx * ratio1, y: y1 + dy * ratio1 };
  const mouthPos: pos = { x: x1 + dx * ratio2, y: y1 + dy * ratio2 };
  const eye2Pos: pos = { x: x1 + dx * ratio3, y: y1 + dy * ratio3 };
  //
  const createEye = (pos: pos) => {
    const initAngle = Math.atan(dx / dy) + Math.PI / 2;
    const deltaAngle = Math.PI;
    const eye: particle[] = [];

    const x1 = Math.cos(initAngle) * radius + pos.x;
    const y1 = Math.sin(initAngle) * radius + pos.y;
    const x2 = Math.cos(initAngle + deltaAngle) * radius + pos.x;
    const y2 = Math.sin(initAngle + deltaAngle) * radius + pos.y;
    const eyeParticle1: particle = { mass, x: x1, y: y1, Ex: 0, Ey: 0 };
    const eyeParticle2: particle = { mass, x: x2, y: y2, Ex: 0, Ey: 0 };
    eye.push(eyeParticle1);
    eye.push(eyeParticle2);
    return eye;
  };
  const createMouth = (pos: pos) => {
    const initAngle = Math.atan(dx / dy) + Math.PI / 2;
    const deltaAngle = Math.PI;
    const mouth: particle[] = [];
    const r = 1.5;
    const x1 = (Math.cos(initAngle) * radius) / r + pos.x;
    const y1 = (Math.sin(initAngle) * radius) / r + pos.y;
    const x2 = (Math.cos(initAngle + deltaAngle) * radius) / r + pos.x;
    const y2 = (Math.sin(initAngle + deltaAngle) * radius) / r + pos.y;
    const mouthParticle1: particle = { mass, x: x1, y: y1, Ex: 0, Ey: 0 };
    const mouthParticle2: particle = { mass, x: x2, y: y2, Ex: 0, Ey: 0 };
    mouth.push(mouthParticle1);
    mouth.push(mouthParticle2);
    return mouth;
  };

  face = [
    ...createEye(eye1Pos),
    ...createMouth(mouthPos),
    ...createEye(eye2Pos),
  ];
  return face;
};

export const changeRest = (
  pairs: pair[],
  index1: number,
  index2: number,
  factor: number
) => {
  for (let i = index1; i < index2; i++) {
    pairs[i].rest -= factor / 10;
  }
};

export const angledEllipse = (
  particle1: particle,
  particle2: particle,
  h: number,
  p5: p5Types
) => {
  const dx = particle2.x - particle1.x;
  const dy = particle2.y - particle1.y;
  const d = Math.sqrt(dx ** 2 + dy ** 2);
  const angle = Math.atan(dx / dy) + Math.PI / 2;
  p5.stroke(0);
  p5.strokeWeight(3);

  const x = (particle1.x + particle2.x) / 2;
  const y = (particle1.y + particle2.y) / 2;

  p5.translate(x, y);
  p5.rotate(-angle);
  p5.ellipse(0, 0, d, h);
  p5.rotate(angle);
  p5.translate(-x, -y);
};

export const p2p = (
  particles: particle[],
  index1: number,
  index2: number,
  strength: number,
  type: string
): pair => {
  const dx = particles[index2].x - particles[index1].x;
  const dy = particles[index2].y - particles[index1].y;
  const d = Math.sqrt(dx * dx + dy * dy);
  const pair: pair = {
    a: index1,
    b: index2,
    rest: d,
    type,
    strength: strength,
  };
  return pair;
};
