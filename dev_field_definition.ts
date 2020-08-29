import { BinaryReader } from "./deps.ts";

export class DevFieldDefinition {
  fieldNum: number;
  size: number;
  devDataIndex: number;
  fieldDef: any;

  constructor(io: BinaryReader, devFieldDefs: any) {
    this.fieldNum = io.readUint8();
    this.size = io.readUint8();
    this.devDataIndex = io.readUint8();
    this.fieldDef = devFieldDefs[this.devDataIndex];
  }
}
