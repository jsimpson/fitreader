import { FIELDS } from "./fields.js";

import { DevFieldDefinition } from "./dev_field_definition.js";
import { FieldDefinition } from "./field_definition.js";

export class DefinitionRecord {
  constructor(io, localNum, devFieldDefs = null) {
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

    if (devFieldDefs !== null) {
      const numDevFields = io.readUint8();
      this.devFieldDefs = new Array(numDevFields);
      for (let i = 0; i < numDevFields; i++) {
        this.devFieldDefs[i] = new DevFieldDefinition(io, devFieldDefs);
      }
    }

    this.dataRecords = [];
  }

  isLittleEndian() {
    return this.architecture === 0;
  }

  hasDefFields() {
    return ((this.devFieldDefs !== undefined) &&
      (this.devFieldDefs.length > 1));
  }

  valid() {
    const fields = FIELDS[this.globalMsgNum];
    if (fields === undefined) {
      return [];
    }

    return this.dataRecords.map((dataRecord) => {
      return dataRecord.valid().filter((dr) => {
        if (dr[0] in fields) {
          return dr;
        }
      });
    });
  }
}
