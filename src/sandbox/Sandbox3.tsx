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
  const circleLink = (nodes: node[]): link[] => {
    const links: link[] = [];
    for (let i = 0; i < nodes.length; i++) {
      if (i === nodes.length - 1) {
        links.push({ a: 0, b: nodes.length - 1 });
      } else {
        links.push({ a: i, b: i + 1 });
      }
    }
    return links;
  };
  const offsetLink = (nodes: node[], offset: number): link[] => {
    const links: link[] = [];

    for (let i = 0; i < nodes.length - 1 - offset; i++) {
      links.push({ a: i, b: i + offset });
    }

    return links;
  };

  var nodes = circleNodes(150, 50);
  //   var links: link[] = [...circleLink(nodes), ...offsetLink(nodes, 3)];
  var links: link[] = [...circleLink(nodes)];

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(500, 500).parent(canvasParentRef);
    // console.log(nodes, links);
  };

  const draw = (p5: p5Types) => {
    p5.background(0);

    zeroForces(nodes);
    spring(nodes, links);
    applyForces(nodes);
    lines(nodes, links, p5);
    plot(nodes, p5);
  };

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
    p5.stroke(255);
    p5.strokeWeight(1);
    p5.line(nodes[link.a].x, nodes[link.a].y, nodes[link.b].x, nodes[link.b].y);
  });
};
const plot = (nodes: node[], p5: p5Types) => {
  nodes.forEach((node) => {
    p5.fill(0);
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
  const k = 12;
  const rest = 15;
  links.forEach((link) => {
    const a = link.a;
    const b = link.b;
    const dx = nodes[b].x - nodes[a].x;
    const dy = nodes[b].y - nodes[a].y;
    const d = Math.sqrt(dx ** 2 + dy ** 2);
    const delta = d - rest;
    const strain = delta / d;
    const ux = dx / d;
    const uy = dy / d;
    const f = strain * k;
    const fx = f * ux;
    const fy = f * uy;
    nodes[a].fx = fx;
    nodes[a].fy = fy;
    nodes[b].fx = -fx;
    nodes[b].fy = -fy;
    nodes[a].vx *= 0.69;
    nodes[a].vy *= 0.69;
    nodes[b].vx *= 0.69;
    nodes[b].vy *= 0.69;
  });
};
