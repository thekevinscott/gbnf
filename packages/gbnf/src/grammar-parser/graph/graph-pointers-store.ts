import { GraphPointer, VisibleGraphPointer, } from "./graph-pointer.js";
import { isRuleEnd, isRuleRef, } from "./types.js";

export class GraphPointersStore {
  keys = new Set<string>();
  pointers = new Set<VisibleGraphPointer>();

  add = (unresolvedPointer: GraphPointer) => {
    for (const pointer of unresolvedPointer.resolve()) {
      if (isRuleRef(pointer.node.rule)) {
        throw new Error('Encountered a reference rule when building pointers to the graph');
      }
      if (isRuleEnd(pointer.node.rule) && !!pointer.parent) {
        throw new Error('Encountered an ending rule with a parent when building pointers to the graph');
      }
      const key = getPointerKey(pointer);
      if (!this.keys.has(key)) {
        this.keys.add(key);
        this.pointers.add(pointer);
      }
    }
  };

  delete = (pointer: VisibleGraphPointer) => {
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
