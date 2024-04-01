export class GenericSet<T, K> {
  #keys = new Set<K>();
  #set = new Set<T>();

  getKey: (el: T) => K;
  constructor(getKey: (el: T) => K) {
    this.getKey = getKey;
  }

  add = (el: T) => {
    const key = this.getKey(el);
    if (!this.#keys.has(key)) {
      this.#keys.add(key);
      this.#set.add(el);
    }
  };

  delete = (el: T) => {
    this.#set.delete(el);
    const key = this.getKey(el);
    this.#keys.delete(key);
  };

  *[Symbol.iterator](): IterableIterator<T> {
    yield* this.#set;
  }
}
