import Yoga, { type Node as YogaNode } from "yoga-wasm-web/auto";

export function getMaxWidth(yogaNode: YogaNode): number {
  return (
    yogaNode.getComputedWidth() -
    yogaNode.getComputedPadding(Yoga.EDGE_LEFT) -
    yogaNode.getComputedPadding(Yoga.EDGE_RIGHT) -
    yogaNode.getComputedBorder(Yoga.EDGE_LEFT) -
    yogaNode.getComputedBorder(Yoga.EDGE_RIGHT)
  );
}

export default getMaxWidth;
