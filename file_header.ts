import { BinaryReader } from "./deps.ts";

export class FileHeader {
  size: number;
  protocolVersion: number;
  profileVersion: number;
  dataSize: number;
  dataType: Uint8Array;
  crc: number;

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

    this.crc = io.readUint16(true);
  }
}