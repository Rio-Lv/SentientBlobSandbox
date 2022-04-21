import React from "react";
import Sketch from "react-p5";
import p5Types from "p5"; //Import this for typechecking and intellisense

interface ComponentProps {
  //Your component props
}

export const Sandbox: React.FC<ComponentProps> = (props: ComponentProps) => {
  //See annotations in JS for more information
  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(window.innerWidth, 800).parent(canvasParentRef);
  };

  const draw = (p5: p5Types) => {};

  return <Sketch setup={setup} draw={draw} />;
};
