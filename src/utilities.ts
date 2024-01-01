import { StorageKeyPart } from "@mtkruto/node";

function UNREACHABLE(): never {
  throw new Error("Unreachable");
}

export enum ValueType {
  Boolean,
  Number,
  String,
  BigInt,
  Date,
  Uint8Array,
  Array,
}

export function toString(value: unknown): string {
  if (typeof value === "boolean") {
    return `${ValueType.Boolean}${Number(value)}`;
  } else if (typeof value === "number") {
    return `${ValueType.Number}${value}`;
  } else if (typeof value === "string") {
    return `${ValueType.String}${value}`;
  } else if (typeof value == "bigint") {
    return `${ValueType.BigInt}${value}`;
  } else if (value instanceof Date) {
    return `${ValueType.Date}${value.getTime()}`;
  } else if (value instanceof Uint8Array) {
    return `${ValueType.Uint8Array}${Buffer.from(value).toString("base64")}`;
  } else if (Array.isArray(value)) {
    const items = value.map((v) => {
      if (typeof v === "string" || v instanceof Uint8Array || Array.isArray(v)) {
        const s = toString(v).slice(1);
        return String(typeof v === "string" ? ValueType.String : v instanceof Uint8Array ? ValueType.Uint8Array : ValueType.Array) + toString(s.length).slice(1) + "\n" + s;
      } else {
        return toString(v);
      }
    });
    return `${ValueType.Array}${items.join("\n")}`;
  } else {
    UNREACHABLE();
  }
}

export function fromString<T>(string: string): T {
  const [type, value] = [Number(string[0]) as ValueType, string.slice(1)];
  switch (type) {
    case ValueType.Boolean:
      return Boolean(Number(value)) as T;
    case ValueType.Number:
      return Number(value) as T;
    case ValueType.String:
      return value as T;
    case ValueType.BigInt:
      return BigInt(value) as T;
    case ValueType.Date:
      return new Date(Number(value)) as T;
    case ValueType.Uint8Array:
      return Buffer.from(value, 'base64') as T;
    case ValueType.Array: {
      const arr = [];
      for (let i = 0; i < value.length; ++i) {
        const type = Number(value[i]) as ValueType;
        let value_ = "";
        while (value[++i] != "\n") {
          value_ += value[i];
          if (i == value.length - 1) {
            break;
          }
        }

        switch (type) {
          case ValueType.String:
          case ValueType.Uint8Array:
          case ValueType.Array: {
            const len = Number(value_);
            ++i;
            value_ = value.slice(i, i + Number(value_));
            i += len;
          }
        }
        arr.push(fromString(`${type}${value_}`));
      }
      return arr as T;
    }
  }
}

export function isInRange(key: StorageKeyPart[], start: readonly StorageKeyPart[], end: readonly StorageKeyPart[]) {
  for (const [i, part] of key.entries()) {
    const left = start[i];
    const right = end[i];
    if (left === undefined || right === undefined) {
      return false;
    }
    if (part >= left && part <= right) {
      continue;
    }
    return false;
  }
  return true;
}
