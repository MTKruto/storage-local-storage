import { GetManyFilter, Storage, StorageKeyPart } from "@mtkruto/node";
import { LocalStorage } from "node-localstorage";
import { fromString, isInRange, toString } from "./utilities";

export class StorageLocalStorage extends Storage implements Storage {
  readonly #prefix: string;
  readonly #localStorage: LocalStorage;

  constructor(prefix: string, localStorage?: LocalStorage) {
    if (prefix.length <= 0) {
      throw new Error("Empty prefix");
    } else if (!/^[0-9a-zA-Z]+$/.test(prefix)) {
      throw new Error("Unallowed prefix");
    }
    super();
    this.#prefix = prefix;
    this.#localStorage = localStorage ?? new LocalStorage(".mtkruto");
  }

  get prefix() {
    return this.#prefix;
  }

  branch(id: string) {
    return new StorageLocalStorage(this.prefix + "S__" + id);
  }

  initialize() {
  }

  get supportsFiles() {
    return false;
  }

  get<T>(key_: readonly StorageKeyPart[]) {
    const key = this.prefix + toString(key_);
    const value = this.#localStorage.getItem(key);
    if (value != null) {
      return fromString<T>(value);
    } else {
      return null;
    }
  }

  *getMany<T>(
    filter: GetManyFilter,
    params?: { limit?: number; reverse?: boolean },
  ) {
    let entries = Object.entries(localStorage).sort(([a], [b]) =>
      a.localeCompare(b)
    );
    if (params?.reverse) {
      entries.reverse();
    }
    if (params?.limit !== undefined) {
      entries = entries.slice(0, params.limit <= 0 ? 1 : params.limit);
    }
    entries: for (let [key, value] of entries) {
      if (key.startsWith(this.prefix)) {
        key = key.slice(this.prefix.length);
      }
      const parts = fromString(key);
      if (Array.isArray(parts)) {
        if ("prefix" in filter) {
          for (const [i, p] of filter.prefix.entries()) {
            if (toString(p) != toString(parts[i])) {
              continue entries;
            }
          }
        } else {
          if (!isInRange(parts, filter.start, filter.end)) {
            continue;
          }
        }

        yield [parts, fromString(value)] as [readonly StorageKeyPart[], T];
      }
    }
  }

  set(key_: readonly StorageKeyPart[], value: unknown) {
    const key = this.prefix + toString(key_);
    if (value != null) {
      this.#localStorage.setItem(key, toString(value));
    } else {
      this.#localStorage.removeItem(key);
    }
  }

  incr(key: readonly StorageKeyPart[], by: number) {
    this.set(key, (this.get<number>(key) || 0) + by);
  }
}
