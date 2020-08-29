import { BinaryReader } from "./deps.ts";
import { DataField } from "./data_field.js";

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

    if (def.hasDevDefs) {
      this.devFields = def.devFieldDefs.map((devFieldDef: any) => {
        const opts = {
          baseNum: devFieldDef.fieldDef["baseTypeId"],
          size: devFieldDef.size,
          arch: devFieldDef.endianness,
        };

        return [devFieldDef.fieldDef["fieldName"], new DataField(io, opts)];
      });
    }
  }

  valid(): any {
    return this.fields.filter((field: any) => {
      if (field[1].valid) {
        return field;
      }
    });
  }

  devFields() {
    return this.devFields ? this.devFields : {};
  }
}
