import { readBit, readBits } from "./bits.js";

export class FieldDefinition {
  constructor(io) {
    this.fieldDefNum = io.readUint8();
    this.size = io.readUint8();
    const byte = io.readUint8();
    this.endianness = readBit(byte, 7);
    this.baseNum = readBits(byte, [4, 0]);
  }
}
