export class GenericSet<T, K> {
  #keys = new Map<K, T>();
  #set = new Set<T>();

  getKey: (el: T) => K;
  constructor(getKey: (el: T) => K) {
    this.getKey = getKey;
  }

  add = (el: T) => {
    const key = this.getKey(el);
    if (!this.#keys.has(key)) {
      this.#keys.set(key, el);
      this.#set.add(el);
    }
  };

  delete = (el: T) => {
    const key = this.getKey(el);
    const ref = this.#keys.get(key);
    this.#keys.delete(key);
    this.#set.delete(ref);
  };

  has = (el: T) => this.#set.has(el);

  *[Symbol.iterator](): IterableIterator<T> {
    yield* this.#set;
  }
}

// export const GenericSet = Set;
