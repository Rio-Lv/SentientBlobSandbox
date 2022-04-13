import React from "react";
import Sketch from "react-p5";
import p5Types from "p5"; //Import this for typechecking and intellisense

interface ComponentProps {
  //Your component props
}

export const Sandbox: React.FC<ComponentProps> = (props: ComponentProps) => {
  //See annotations in JS for more information
  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(500, 500).parent(canvasParentRef);
  };

  const draw = (p5: p5Types) => {
    p5.background(0);
    spring(previousNodes, { a: 0, b: 1 });
    spring(previousNodes, { a: 1, b: 2 });
    spring(previousNodes, { a: 2, b: 0 });

    applyForces(currentNodes);
    plot(currentNodes[0], currentNodes[1], p5);
    plot(currentNodes[1], currentNodes[2], p5);
    plot(currentNodes[2], currentNodes[0], p5);
    previousNodes = currentNodes;
  };

  return <Sketch setup={setup} draw={draw} />;
};

type node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ax: number;
  ay: number;
  fx: number;
  fy: number;
  mass: number;
};
type link = {
  a: number;
  b: number;
};
const plot = (a: node, b: node, p5: p5Types) => {
  p5.stroke(255);
  p5.strokeWeight(1);
  p5.fill(0);
  p5.ellipse(a.x, a.y, 10, 10);
  p5.ellipse(b.x, b.y, 10, 10);
  p5.line(a.x, a.y, b.x, b.y);
};
const spring = (prev: node[], link: link): node[] => {
  const rest = 200;
  const a = link.a;
  const b = link.b;
  var next: node[] = prev;
  const dx = next[a].x - next[b].x;
  const dy = next[a].y - next[b].y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / dist;
  const uy = dy / dist;

  const delta = dist - rest;
  const strain = delta / dist;
  const k = 0.1;
  const d = 0;
  const f = strain * k;
  const fx = ux * f;
  const fy = uy * f;
  next[a].fx = fx;
  next[a].fy = fy;
  next[b].fx = -fx;
  next[b].fy = -fy;
  next[a].vx *= 0.99;
  next[a].vy *= 0.99;
  next[b].vx *= 0.99;
  next[b].vy *= 0.99;

  return next;
};

const applyForces = (nodes: node[]) => {
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].ax = nodes[i].fx / nodes[i].mass;
    nodes[i].ay = nodes[i].fy / nodes[i].mass;
    nodes[i].vx += nodes[i].ax;
    nodes[i].vy += nodes[i].ay;
    nodes[i].x += nodes[i].vx;
    nodes[i].y += nodes[i].vy;
  }
};
var currentNodes: node[] = [
  { x: 200, y: 200, vx: 1, vy: 0, ax: 0, ay: 0, fx: 0, fy: 0, mass: 10 },
  { x: 300, y: 300, vx: 0, vy: 0, ax: 0, ay: 0, fx: 0, fy: 0, mass: 10 },
  { x: 250, y: 350, vx: -1, vy: 0, ax: 0, ay: 0, fx: 0, fy: 0, mass: 10 },
];

var previousNodes: node[] = currentNodes;
