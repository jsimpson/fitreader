import { BinaryReader } from "./deps.ts";

import { DATA_TYPES } from "./data_types.ts";

export class DataField {
  data: any;
  valid: boolean;

  constructor(io: BinaryReader, opts: {[index: string]: any }) {
    const baseNum = opts["baseNum"];
    const size = opts["size"];
    const arch = opts["arch"];
    const littleEndian = arch === 1;

    const base = DATA_TYPES[baseNum];

    const multiples = opts["size"] / base["size"];

    switch (base["typeName"]) {
      case "enum":
      case "byte":
      case "uint8":
      case "uint8z":
        if (multiples > 1) {
          this.data = new Uint8Array(multiples);
          for (let i = 0; i < multiples; i++) {
            this.data[i] = io.readUint8();
          }
        } else {
          this.data = io.readUint8();
        }
        break;
      case "sint8":
        if (multiples > 1) {
          this.data = new Int8Array(multiples);
          for (let i = 0; i < multiples; i++) {
            this.data[i] = io.readInt8();
          }
        } else {
          this.data = io.readInt8();
        }
        break;
      case "uint16":
      case "uint16z":
        if (multiples > 1) {
          this.data = new Uint16Array(multiples);
          for (let i = 0; i < multiples; i++) {
            this.data[i] = io.readUint16(littleEndian);
          }
        } else {
          this.data = io.readUint16(littleEndian);
        }
        break;
      case "sint16":
        if (multiples > 1) {
          this.data = new Int16Array(multiples);
          for (let i = 0; i < multiples; i++) {
            this.data[i] = io.readInt16(littleEndian);
          }
        } else {
          this.data = io.readInt16(littleEndian);
        }
        break;
      case "uint32":
      case "uint32z":
        if (multiples > 1) {
          this.data = new Uint32Array(multiples);
          for (let i = 0; i < multiples; i++) {
            this.data[i] = io.readUint32(littleEndian);
          }
        } else {
          this.data = io.readUint32(littleEndian);
        }
        break;
      case "sint32":
        if (multiples > 1) {
          this.data = new Int32Array(multiples);
          for (let i = 0; i < multiples; i++) {
            this.data[i] = io.readInt32(littleEndian);
          }
        } else {
          this.data = io.readInt32(littleEndian);
        }
        break;
      case "float32":
        if (multiples > 1) {
          this.data = new Float32Array(multiples);
          for (let i = 0; i < multiples; i++) {
            this.data[i] = io.readFloat32(littleEndian);
          }
        } else {
          this.data = io.readFloat32(littleEndian);
        }
        break;
      case "float64":
        if (multiples > 1) {
          this.data = new Float64Array(multiples);
          for (let i = 0; i < multiples; i++) {
            this.data[i] = io.readFloat64(littleEndian);
          }
        } else {
          this.data = io.readFloat64(littleEndian);
        }
        break;
      case "uint64":
      case "uint64z":
        if (multiples > 1) {
          this.data = new Array(multiples);
          for (let i = 0; i < multiples; i++) {
            this.data[i] = io.readBigUint64(littleEndian);
          }
        } else {
          this.data = io.readBigUint64(littleEndian);
        }
        break;
      case "sint64":
        if (multiples > 1) {
          this.data = new Array(multiples);
          for (let i = 0; i < multiples; i++) {
            this.data[i] = io.readBigInt64(littleEndian);
          }
        } else {
          this.data = io.readBigInt64(littleEndian);
        }
        break;
      case "string":
        this.data = io.readString(size);
        break;
      default:
        console.log(`Error reading base type: ${base}`);
        Deno.exit(1);
        break;
    }

    this.valid = this.check(this.data, base["invalidValue"]);
  }

  check(data: any, invalid: number): boolean {
    if (Array.isArray(data)) {
      const valid = data.map((d) => {
        return d !== invalid;
      });

      return valid.length > 0;
    }

    return data !== invalid;
  }
}
