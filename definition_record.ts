import { BinaryReader } from "./deps.ts";

import { FIELDS } from "./fields.ts";

import { DataField } from "./data_field.ts";
import { valid, DataRecord } from "./data_record.ts";
import { FieldDefinition } from "./field_definition.ts";

export class DefinitionRecord {
  localNum: number;
  reserved: number;
  architecture: number;
  globalMsgNum: number;
  fieldDefinitions: FieldDefinition[];
  dataRecords: DataRecord[];

  constructor(io: BinaryReader, localNum: number) {
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

    this.dataRecords = [];
  }

  isLittleEndian(): boolean {
    return this.architecture === 0;
  }

  valid(): [number, DataField][][] {
    const fields = FIELDS[this.globalMsgNum];
    if (fields === undefined) {
      return [];
    }

    return this.dataRecords.map((dataRecord: DataRecord) => {
      return valid(dataRecord).filter((dr: [number, DataField]) => {
        if (dr[0] in fields) {
          return dr;
        }
      });
    });
  }
}
