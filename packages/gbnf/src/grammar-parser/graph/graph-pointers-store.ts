import { GraphPointer, } from "./graph-pointer.js";

export class GraphPointersStore {
  #keys = new Set<string>();
  #pointers = new Set<GraphPointer>();

  add = (pointer: GraphPointer) => {
    const key = getPointerKey(pointer);
    if (!this.#keys.has(key)) {
      this.#keys.add(key);
      this.#pointers.add(pointer);
    }
  };

  delete = (pointer: GraphPointer) => {
    this.#pointers.delete(pointer);
    const key = getPointerKey(pointer);
    this.#keys.delete(key);
  };

  *[Symbol.iterator](): IterableIterator<GraphPointer> {
    for (const pointer of this.#pointers) {
      yield pointer;
    }
  };

  increment = () => {
    const remainingPointers = this.#pointers;
    this.#pointers = new Set<GraphPointer>();
    this.#keys = new Set<string>();
    for (const pointer of remainingPointers) {
      for (const nextPointer of pointer) {
        this.#pointers.add(nextPointer);
      }
    }
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
