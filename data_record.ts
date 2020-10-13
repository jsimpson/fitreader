import { BinaryReader } from "./deps.ts";
import { DataField } from "./data_field.ts";

export class DataRecord {
  globalNum: number;
  fields: [];

  constructor(io: BinaryReader, def: any) {
    this.globalNum = def.globalMsgNum;
    this.fields = def.fieldDefinitions.map((fieldDef: any) => {
      const opts = {
        baseNum: fieldDef.baseNum,
        size: fieldDef.size,
        arch: fieldDef.endianness,
      };

      return [fieldDef.fieldDefNum, new DataField(io, opts)];
    });
  }

  valid(): any {
    return this.fields.filter((field: any) => {
      if (field[1].valid) {
        return field;
      }
    });
  }
}
