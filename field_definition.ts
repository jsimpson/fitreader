import { BinaryReader } from "./deps.ts";
import { readBit, readBits } from "./bits.ts";

export class FieldDefinition {
  fieldDefNum: number;
  size: number;
  endianness: number;
  baseNum: number;

  constructor(io: BinaryReader) {
    this.fieldDefNum = io.readUint8();
    this.size = io.readUint8();
    const byte = io.readUint8();
    this.endianness = readBit(byte, 7);
    this.baseNum = readBits(byte, [4, 0]);
  }
}
