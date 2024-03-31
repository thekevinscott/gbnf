import { GraphPointer, } from "./graph-pointer.js";

export class GraphPointersStore {
  keys = new Set<string>();
  pointers = new Set<GraphPointer>();

  add = (pointer: GraphPointer) => {
    const key = getPointerKey(pointer);
    if (!this.keys.has(key)) {
      this.keys.add(key);
      this.pointers.add(pointer);
    }
  };

  delete = (pointer: GraphPointer) => {
    this.pointers.delete(pointer);
    const key = getPointerKey(pointer);
    this.keys.delete(key);
  };
}

const getPointerKey = ({
  node: {
    id,
    meta: {
      stackId,
      pathId,
      stepId,
    },
  },
  parent,
}: GraphPointer): string => JSON.stringify({
  id,
  stackId, pathId, stepId,
  parent: parent ? getPointerKey(parent) : null,
});
