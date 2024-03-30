// import { isRuleDefRef } from "../../types.js";
import { GraphPointer, } from "./graph-pointer.js";
import type { Graph, } from "./graph.js";

export class Pointers {
  #keys = new Set<string>();
  #pointers = new Set<GraphPointer>();
  #graph: Graph;

  constructor(graph: Graph) {
    this.#graph = graph;
  }

  add(pointer: GraphPointer) {
    const key = getKey(pointer);
    if (!this.#keys.has(key)) {
      this.#keys.add(key);
      this.#pointers.add(pointer);
    } else {
      // console.log('skip!')
    }
  }

  delete(pointer: GraphPointer) {
    this.#pointers.delete(pointer);
    const key = getKey(pointer);
    this.#keys.delete(key);
  }

  *[Symbol.iterator](): IterableIterator<GraphPointer> {
    for (const pointer of this.#pointers) {
      yield pointer;
    }
  };

  increment = () => {
    // console.log('increment pointers')
    const remainingPointers = this.#pointers;
    this.#pointers = new Set<GraphPointer>();
    this.#keys = new Set<string>();
    for (const pointer of remainingPointers) {
      // console.log('handle pointer pointing at', pointer.node.stackId, pointer.node.pathId, pointer.node.stepId)
      for (const { node, parent, } of pointer.nextNodes()) {
        // console.log('next', node.stackId, node.pathId, node.stepId)
        // const parent = isRuleDefRef(pointer.node.rule) ? pointer : undefined;
        // console.log('parent', parent?.node.stackId, parent?.node.pathId, parent?.node.stepId)
        // console.log('add a new pointer to', node.stackId, node.pathId, node.stepId, 'with parent', parent?.node.stackId, parent?.node.pathId, parent?.node.stepId)
        this.#pointers.add(new GraphPointer(this.#graph, node, parent));
        // this.#pointers.add(new GraphPointer(this.#graph, node, pointer.parent));
      }
      pointer.node.deletePointer(pointer);
      // console.log('now release it')
    }
  };
}

const getKey = ({ node: { id, stackId, pathId, stepId, }, parent, }: GraphPointer): string => {
  return JSON.stringify({
    id,
    stackId, pathId, stepId,
    parent: parent ? getKey(parent) : null,
  });
};
