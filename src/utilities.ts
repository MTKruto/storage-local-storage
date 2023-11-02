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
    return JSON.stringify([ValueType.Boolean, value]);
  } else if (typeof value === "number") {
    return JSON.stringify([ValueType.Number, value]);
  } else if (typeof value === "string") {
    return JSON.stringify([ValueType.String, value]);
  } else if (typeof value == "bigint") {
    return JSON.stringify([ValueType.BigInt, String(value)]);
  } else if (value instanceof Date) {
    return JSON.stringify([ValueType.Date, value.getTime()]);
  } else if (value instanceof Uint8Array) {
    return JSON.stringify([
      ValueType.Uint8Array,
      Buffer.from(value).toString("base64"),
    ]);
  } else if (Array.isArray(value)) {
    return JSON.stringify([ValueType.Array, value.map(toString)]);
  } else {
    UNREACHABLE();
  }
}

export function fromString<T>(string: string) {
  const [type, value] = JSON.parse(string);
  if (
    type == ValueType.Boolean || type == ValueType.Number ||
    type == ValueType.String
  ) {
    return value as T;
  } else if (type == ValueType.BigInt) {
    return BigInt(value) as T;
  } else if (type == ValueType.Date) {
    return new Date(value) as T;
  } else if (type == ValueType.Uint8Array) {
    return Buffer.from(value, "base64");
  } else if (type == ValueType.Array) {
    return value.map(fromString);
  } else {
    UNREACHABLE();
  }
}
