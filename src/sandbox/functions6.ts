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
};

const initEnergy = (particles: particle[]): energy[] => {
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
  T[pair.a].x += Tx * D;
  T[pair.a].y += Ty * D;
  T[pair.b].x -= Tx * D;
  T[pair.b].y -= Ty * D;
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
    p5.fill(255);
    p5.stroke(255);
    p5.circle(particles[i].x, particles[i].y, 5);
  }
};

export const drawPairs = (
  particles: particle[],
  pairs: pair[],
  p5: p5Types
) => {
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    p5.stroke(180);
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
      Ey: 0,
    });
  }
  return particles;
};

const ox = 500;
const oy = 150;

export const circularPairs = (
  particles: particle[],
  offset: number,
  strength: number
): pair[] => {
  const pairs: pair[] = [];
  for (let i = 0; i < particles.length; i++) {
    if (i < particles.length - offset) {
      const a = i;
      const b = i + offset;
      const dx = particles[b].x - particles[a].x;
      const dy = particles[b].y - particles[a].y;
      const rest = Math.sqrt(dx * dx + dy * dy);
      pairs.push({ a, b, rest, strength });
    } else {
      const a = i;
      const b = i - particles.length + offset;
      const dx = particles[b].x - particles[a].x;
      const dy = particles[b].y - particles[a].y;
      const rest = Math.sqrt(dx * dx + dy * dy);
      pairs.push({ a, b, rest, strength });
    }
  }
  return pairs;
};

export const particles: particle[] = circularParticles(64, 100, ox, oy, 10);

export const pairs = [
  ...circularPairs(particles, 1, 1),
  ...circularPairs(particles, 2, 1),
  ...circularPairs(particles, 4, 1),
  ...circularPairs(particles, 8, 0.8),
  ...circularPairs(particles, 16, 0.6),
  ...circularPairs(particles, 32, 0.3),
];

export const T = initEnergy(particles); // kinetic Energy For each particle

export const curveVertex = (
  particles: particle[],
  index1: number,
  index2: number,
  p5: p5Types
) => {
  p5.noFill();
  p5.stroke(0);
  p5.strokeWeight(4);
  p5.curveTightness(0.1);

  const d = 4;
  p5.beginShape();
  p5.curveVertex(particles[index2 - d].x, particles[index2 - d].y);
  for (let i = index1; i < index2; i += d) {
    p5.curveVertex(particles[i].x, particles[i].y);
  }
  p5.curveVertex(particles[index1].x, particles[index1].y);
  p5.curveVertex(particles[index1 + d].x, particles[index1 + d].y);

  p5.endShape();
};
