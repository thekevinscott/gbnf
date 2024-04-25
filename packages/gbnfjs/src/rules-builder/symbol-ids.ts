export class SymbolIds {
  // we don't need to delete, just preserve relationships
  #map = new Map<string, number>();
  #pos = new Map<string, number>();
  #reverseMap = new Map<number, string>();

  get size(): number {
    return this.#map.size;
  }

  keys(): IterableIterator<string> {
    return this.#map.keys();
  }

  has(key: string): boolean {
    return this.#map.has(key);
  }

  get(key: string): number {
    return this.#map.get(key);
  }
  reverseGet(key: number): string {
    return this.#reverseMap.get(key);
  }
  getPos(key: string): number {
    return this.#pos.get(key);
  }
  set(key: string, value: number, pos: number): void {
    this.#map.set(key, value);
    this.#pos.set(key, pos);
    this.#reverseMap.set(value, key);
  }

  *[Symbol.iterator](): IterableIterator<[string, number]> {
    yield* this.#map;
  }
}
