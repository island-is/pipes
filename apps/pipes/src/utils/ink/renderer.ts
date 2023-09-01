import { type DOMElement } from "./dom.js";
import Output from "./output.js";
import renderNodeToOutput from "./render-node-to-output.js";

const renderer = (node: DOMElement): string => {
  if (node.yogaNode) {
    const output = new Output({
      width: node.yogaNode.getComputedWidth(),
      height: node.yogaNode.getComputedHeight(),
    });

    renderNodeToOutput(node, output, { skipStaticElements: true });

    let { output: generatedOutput } = output.get();

    let staticOutput;

    if (node.staticNode?.yogaNode) {
      staticOutput = new Output({
        width: node.staticNode.yogaNode.getComputedWidth(),
        height: node.staticNode.yogaNode.getComputedHeight(),
      });

      renderNodeToOutput(node.staticNode, staticOutput, {
        skipStaticElements: false,
      });
    }

    if (staticOutput) {
      generatedOutput = `${staticOutput.get().output}\n${generatedOutput}`;
    }

    return generatedOutput;
  }

  return "";
};

export default renderer;
