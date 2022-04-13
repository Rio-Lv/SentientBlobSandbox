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
  for (let i = 0; i < particles.length; i++) {
    if (particles[i].x >= w) {
      T[i].x *= -loss;
      T[i].y *= friction;
      particles[i].x = w;
    }
    if (particles[i].x <= 0) {
      T[i].x *= -loss;
      T[i].y *= friction;
      particles[i].x = 0;
    }
    if (particles[i].y >= h) {
      T[i].y *= -loss;
      T[i].x *= friction;
      particles[i].y = h - 1;
    }
    if (particles[i].y <= 0) {
      T[i].y *= -loss;
      T[i].x *= friction;
      particles[i].y = 0;
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
    p5.stroke(100);
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
      Ex: 100,
      Ey: 0,
    });
  }
  return particles;
};

const ox = 300;
const oy = 300;

const circularPairs = (
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

export const particles: particle[] = circularParticles(58, 100, ox, oy, 5);

export const pairs = [
  ...circularPairs(particles, 1, 1),
  ...circularPairs(particles, 2, 2),
  ...circularPairs(particles, 5, 3),
  ...circularPairs(particles, 22, 0.4),
  // ...circularPairs(particles, 10),
];

export const T = initEnergy(particles); // kinetic Energy For each particle

// export const particles: particle[] = [
//   { m: 10, x: 100, y: 200, Ex: 100, Ey: 0 },
//   { m: 10, x: 200, y: 210, Ex: 100, Ey: 0 },
//   { m: 10, x: 300, y: 220, Ex: -100, Ey: 0 },
//   { m: 10, x: 400, y: 230, Ex: -100, Ey: 0 },
//   { m: 10, x: 500, y: 240, Ex: -100, Ey: 0 },
//   { m: 10, x: 600, y: 250, Ex: 100, Ey: 0 },
//   { m: 10, x: 700, y: 260, Ex: 100, Ey: 0 },
//   { m: 10, x: 800, y: 270, Ex: -100, Ey: 0 },
//   { m: 10, x: 900, y: 280, Ex: -100, Ey: 0 },
//   { m: 10, x: 1000, y: 200, Ex: -100, Ey: 0 },
// ];
