import { readBit, readBits } from "./bits.ts";

export class RecordHeader {
  constructor(io) {
    const byte = io.readUint8();

    this.headerType = readBit(byte, 7);
    if (this.headerType === 0) {
      this.messageType = readBit(byte, 6);
      this.messageTypeSpecific = readBit(byte, 5);
      this.reserved = readBit(byte, 4);
      this.localMesssageType = readBits(byte, [3, 0]);
    } else {
      this.localMesssageType = readBits(byte, [6, 5]);
      this.timeOffset = readBits(byte, [4, 0]);
    }
  }

  isDefinition() {
    return this.headerType === 0 && this.messageType == 1;
  }

  isData() {
    return this.headerType === 0 && this.messageType == 0;
  }

  hasDevDefs() {
    return this.messageTypeSpecific === 1;
  }

  hasTimestamp() {
    return this.headerType === 1;
  }
}
