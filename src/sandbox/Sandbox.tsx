import React from "react";
import Sketch from "react-p5";
import p5Types from "p5"; //Import this for typechecking and intellisense

interface ComponentProps {
  //Your component props
}

type node = {
  mass: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ax: number;
  ay: number;
  fx: number;
  fy: number;
};

type link = {
  node1: node;
  node2: node;
};

var nodes: node[] = [
  {
    mass: 15,
    x: 250,
    y: 200,
    vx: 0,
    vy: 0,
    ax: 0,
    ay: 0,
    fx: 0,
    fy: 0,
  },
  {
    mass: 15,
    x: 250,
    y: 300,
    vx: 0,
    vy: 0,
    ax: 0,
    ay: 0,
    fx: 0,
    fy: 0,
  },

  {
    mass: 10,
    x: 350,
    y: 300,
    vx: 0,
    vy: 0,
    ax: 0,
    ay: 0,
    fx: 0,
    fy: 0,
  },
];

var links: link[] = [
  { node1: nodes[0], node2: nodes[1] },
  { node1: nodes[1], node2: nodes[2] },
  { node1: nodes[2], node2: nodes[0] },
];

const Spring = (link: link) => {
  const dx = link.node1.x - link.node2.x;
  const dy = link.node1.y - link.node2.y;
  const d = Math.sqrt(dx * dx + dy * dy);
  const f = (d - 101) * 0.1;
  const fx = (f * dx) / d;
  const fy = (f * dy) / d;
  link.node1.fx += fx;
  link.node1.fy += fy;
  link.node2.fx -= fx;
  link.node2.fy -= fy;
};
const plotNodes = (nodes: node[], p5: p5Types) => {
  nodes.forEach((node) => {
    p5.stroke(255);
    p5.strokeWeight(1);
    p5.fill(0);
    p5.ellipse(node.x, node.y, 10, 10);
  });
};
const drawLine = (link: link, p5: p5Types) => {
  p5.strokeWeight(1);
  p5.stroke(255);
  p5.line(link.node1.x, link.node1.y, link.node2.x, link.node2.y);
};

const euler = (nodes: node[]) => {
  nodes.forEach((node) => {
    node.ax = node.fx / node.mass;
    node.vx += node.ax;
    node.x += node.vx;

    node.ay = node.fy / node.mass;
    node.vy += node.ay;
    node.y += node.vy;
  });
};

export const Sandbox: React.FC<ComponentProps> = (props: ComponentProps) => {
  //See annotations in JS for more information
  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(500, 500).parent(canvasParentRef);
  };

  const draw = (p5: p5Types) => {
    p5.background(0);

    plotNodes(nodes, p5);
    drawLine(links[0], p5);
    // drawLine(links[1], p5);
    // drawLine(links[2], p5);
    // Spring(links[0]);
    // Spring(links[1]);
    Spring(links[0]);
    euler(nodes);
  };

  return <Sketch setup={setup} draw={draw} />;
};
