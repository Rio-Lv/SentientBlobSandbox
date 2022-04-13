import React from "react";
import Sketch from "react-p5";
import p5Types from "p5";

interface ComponentProps {}

type node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ax: number;
  ay: number;
  fx: number;
  fy: number;
  m: number;
};
type link = {
  a: number;
  b: number;
  s: number;
};

export const Sandbox: React.FC<ComponentProps> = (props: ComponentProps) => {
  const randomNodes = (quantity: number) => {
    var nodes: node[] = [];
    for (let i = 0; i < quantity; i++) {
      nodes.push({
        x: Math.random() * 500,
        y: Math.random() * 500,
        vx: 0,
        vy: 0,
        ax: 0,
        ay: 0,
        fx: 0,
        fy: 0,
        m: 1,
      });
    }
    return nodes;
  };
  const circleNodes = (quantity: number, radius: number) => {
    const shellAngle = (Math.PI * 2) / quantity;
    const shellRadius = radius;
    const getY = (index: number) => {
      return Math.sin(index * shellAngle) * shellRadius;
    };
    const getX = (index: number) => {
      return Math.cos(index * shellAngle) * shellRadius;
    };
    const nodes: node[] = [];
    for (let i = 0; i < quantity; i++) {
      nodes.push({
        x: getX(i) + 250,
        y: getY(i) + 250,
        vx: 10,
        vy: 0,
        ax: 0,
        ay: 0,
        fx: 0,
        fy: 0,
        m: 1,
      });
    }
    return nodes;
  };
  const circleLink = (nodes: node[]): link[] => {
    const links: link[] = [];
    for (let i = 0; i < nodes.length; i++) {
      if (i === nodes.length - 1) {
        links.push({ a: 0, b: nodes.length - 1, s: 0 });
      } else {
        links.push({ a: i, b: i + 1, s: 0 });
      }
    }

    return links;
  };
  const offsetLink = (nodes: node[], offset: number): link[] => {
    const links: link[] = [];

    for (let i = 0; i < nodes.length - 1 - offset; i++) {
      links.push({ a: i, b: i + offset, s: 0 });
    }
    for (let i = nodes.length - offset - 1; i < nodes.length; i++) {
      links.push({ a: i, b: i - offset, s: 0 });
    }

    return links;
  };
  //================================================================================= num nodes
  var nodes = circleNodes(97, 100);
  // var links: link[] = [...circleLink(nodes), ...offsetLink(nodes, 3)];
  var links: link[] = circleLink(nodes);
  // links = [...links, ...offsetLink(nodes, 3)];
  // links.push({ a: 2, b: 4, s: 0 });
  //===========================================================================================================================
  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(500, 500).parent(canvasParentRef);
    console.log(nodes, links);
  };
  //=========================================================================================================================
  const draw = (p5: p5Types) => {
    p5.background(0);
    spring(nodes, links);
    // zeroForces(nodes);
    // airResistance(nodes, 0.95);
    boundingBox(nodes, 500, 500);
    // gravity(nodes, 0.5);
    applyForces(nodes);
    lines(nodes, links, p5);
    plot(nodes, p5);
  };
  //========================================================================================================================
  return <Sketch setup={setup} draw={draw} />;
};

const applyForces = (nodes: node[]) => {
  nodes.forEach((node) => {
    node.ax = node.fx / node.m;
    node.ay = node.fy / node.m;
    node.vx += node.ax;
    node.vy += node.ay;
    node.x += node.vx;
    node.y += node.vy;
  });
};
const lines = (nodes: node[], links: link[], p5: p5Types) => {
  links.forEach((link) => {
    p5.stroke(link.s * 10 + 50);
    p5.strokeWeight(1);
    p5.line(nodes[link.a].x, nodes[link.a].y, nodes[link.b].x, nodes[link.b].y);
  });
};
const plot = (nodes: node[], p5: p5Types) => {
  nodes.forEach((node) => {
    p5.stroke(255);
    if (node === nodes[0] || node === nodes[1]) {
      p5.fill(255, 0, 0);
    } else {
      p5.fill(0);
    }
    p5.circle(node.x, node.y, 8);
  });
};
const zeroForces = (nodes: node[]) => {
  nodes.forEach((node) => {
    node.fx = 0;
    node.fy = 0;
  });
};

const spring = (nodes: node[], links: link[]) => {
  const k = 51;
  const kd = 0.0001;
  const rest = 20;
  var next: node[] = [...nodes];
  for (let i = 0; i < links.length; i++) {
    const a = links[i].a;
    const b = links[i].b;
    const dx = nodes[b].x - nodes[a].x;
    const dy = nodes[b].y - nodes[a].y;
    const d = Math.sqrt(dx ** 2 + dy ** 2);
    const delta = d - rest;
    const strain = delta / d;
    const ux = dx / d;
    const uy = dy / d;

    const dvx = nodes[b].vx - nodes[a].vx;
    const dvy = nodes[b].vy - nodes[a].vy;
    const dv = Math.abs(dvx ** 2 + dvy ** 2);
    const dot = dvx ** 2 + dvy ** 2;

    const damp = 0.2;

    const uvx = dvx / dv;
    const uvy = dvy / dv;

    const f = strain * k;
    const fx = f * ux;
    const fy = f * uy;
    next[a].fx = fx;
    next[a].fy = fy;
    next[b].fx = -fx;
    next[b].fy = -fy;

    next[a].vx *= damp;
    next[a].vy *= damp;
    next[b].vx *= damp;
    next[b].vy *= damp;

    links[i].s = Math.abs(delta);
  }
  nodes = next;
};

const gravity = (nodes: node[], G: number) => {
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].fy += nodes[i].m * G;
  }
};
const airResistance = (nodes: node[], K: number) => {
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].vx *= K;
    nodes[i].vy *= K;
  }
};
const boundingBox = (Nodes: node[], width: number, height: number) => {
  let minX = 1;
  let maxX = width - 1;
  let minY = 1;
  let maxY = height - 1;
  for (let i = 0; i < Nodes.length; i++) {
    const { x, y, vx, vy } = Nodes[i];

    if (x + vx < minX) {
      Nodes[i].vx *= -1;
      Nodes[i].x = minX + 1;
    }
    if (x + vx > maxX) {
      Nodes[i].vx *= -1;
      Nodes[i].x = maxX - 1;
    }
    if (y + vy < minY) {
      Nodes[i].vy *= -1;
      Nodes[i].y = minY + 1;
    }
    if (y + vy > maxY) {
      Nodes[i].vy *= -1;
      Nodes[i].y = maxY - 1;
    }
  }
};
