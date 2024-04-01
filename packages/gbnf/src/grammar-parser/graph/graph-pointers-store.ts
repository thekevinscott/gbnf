import { VisibleGraphPointer, getPointerKey, } from "./graph-pointer.js";

export class GraphPointersStore {
  keys = new Set<string>();
  pointers = new Set<VisibleGraphPointer>();

  add = (pointer: VisibleGraphPointer) => {
    const key = getPointerKey(pointer);
    if (!this.keys.has(key)) {
      this.keys.add(key);
      this.pointers.add(pointer);
    }
  };

  delete = (pointer: VisibleGraphPointer) => {
    this.pointers.delete(pointer);
    const key = getPointerKey(pointer);
    this.keys.delete(key);
  };
}
