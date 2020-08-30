import { BinaryReader } from "./deps.ts";

import { FIELDS } from "./fields.ts";

import { DevFieldDefinition } from "./dev_field_definition.ts";
import { FieldDefinition } from "./field_definition.ts";

export class DefinitionRecord {
  localNum: number;
  reserved: number;
  architecture: number;
  globalMsgNum: number;
  fieldDefinitions: any;
  devFieldDefs: any;
  dataRecords: any;

  constructor(io: BinaryReader, localNum: number, devFieldDefs?: any) {
    this.localNum = localNum;

    this.reserved = io.readUint8();
    this.architecture = io.readUint8();
    const littleEndian = this.architecture === 0;
    this.globalMsgNum = io.readUint16(littleEndian);
    const numFields = io.readUint8();

    this.fieldDefinitions = new Array(numFields);
    for (let i = 0; i < numFields; i++) {
      this.fieldDefinitions[i] = new FieldDefinition(io);
    }

    if (devFieldDefs !== undefined) {
      const numDevFields = io.readUint8();
      this.devFieldDefs = new Array(numDevFields);
      for (let i = 0; i < numDevFields; i++) {
        this.devFieldDefs[i] = new DevFieldDefinition(io, devFieldDefs);
      }
    }

    this.dataRecords = [];
  }

  isLittleEndian(): boolean {
    return this.architecture === 0;
  }

  hasDefFields(): boolean {
    return this.devFieldDefs !== undefined && this.devFieldDefs.length > 1;
  }

  valid(): any {
    const fields = FIELDS[this.globalMsgNum];
    if (fields === undefined) {
      return [];
    }

    return this.dataRecords.map((dataRecord: any) => {
      return dataRecord.valid().filter((dr: any) => {
        if (dr[0] in fields) {
          return dr;
        }
      });
    });
  }
}
