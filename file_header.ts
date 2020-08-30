import { BinaryReader } from "./deps.ts";

export class FileHeader {
  size: number;
  protocolVersion: number;
  profileVersion: number;
  dataSize: number;
  dataType: Uint8Array;
  crc: number | undefined;

  constructor(io: BinaryReader) {
    this.size = io.readUint8();
    this.protocolVersion = io.readUint8();
    this.profileVersion = io.readUint16(true);
    this.dataSize = io.readUint32(true);

    this.dataType = new Uint8Array(4);
    this.dataType[0] = io.readUint8();
    this.dataType[1] = io.readUint8();
    this.dataType[2] = io.readUint8();
    this.dataType[3] = io.readUint8();

    // 12-byte file headers will not have a header CRC.
    if (this.size === 14) {
      this.crc = io.readUint16(true);
    }
  }
}
