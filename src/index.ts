import { Storage, StorageKeyPart } from "@mtkruto/node";
import { LocalStorage } from "node-localstorage";
import { fromString, toString } from "./utilities";

export class StorageLocalStorage extends Storage implements Storage {
  constructor(
    private readonly prefix: string,
    private readonly localStorage = new LocalStorage(".mtkruto"),
  ) {
    if (prefix.length <= 0) {
      throw new Error("Empty prefix");
    } else if (!/^[0-9a-zA-Z]+$/.test(prefix)) {
      throw new Error("Unallowed prefix");
    }
    super();
  }

  init() {
  }

  get(key_: readonly StorageKeyPart[]) {
    const key = this.prefix + toString(key_);
    const value = this.localStorage.getItem(key);
    if (value != null) {
      return fromString(value);
    } else {
      return null;
    }
  }

  *getMany<T>(prefix: readonly StorageKeyPart[]) {
    for (let [key, value] of Object.entries(this.localStorage)) {
      if (key.startsWith(this.prefix)) {
        key = key.slice(this.prefix.length);
      }
      const parts = fromString(key);
      if (Array.isArray(parts)) {
        for (const [i, p] of prefix.entries()) {
          if (toString(p) != toString(parts[i])) {
            continue;
          }
          yield [parts, fromString(value)] as [readonly StorageKeyPart[], T];
        }
      }
    }
  }

  set(key_: readonly StorageKeyPart[], value: unknown) {
    const key = this.prefix + toString(key_);
    if (value != null) {
      this.localStorage.setItem(key, toString(value));
    } else {
      this.localStorage.removeItem(key);
    }
  }
}
