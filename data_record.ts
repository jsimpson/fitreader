import { BinaryReader } from "./deps.ts";
import { DataField } from "./data_field.ts";
import { DefinitionRecord } from "./definition_record.ts";
import { FieldDefinition } from "./field_definition.ts";

export class DataRecord {
  globalNum: number;
  fields: [number, DataField][];

  constructor(io: BinaryReader, def: DefinitionRecord) {
    this.globalNum = def.globalMsgNum;
    this.fields = def.fieldDefinitions.map((fieldDef: FieldDefinition) => {
      const opts = {
        baseNum: fieldDef.baseNum,
        size: fieldDef.size,
        arch: fieldDef.endianness,
      };

      return [fieldDef.fieldDefNum, new DataField(io, opts)];
    });
  }

  valid(): [number, DataField][] {
    return this.fields.filter((field: [number, DataField]) => {
      if (field[1].valid) {
        return field;
      }
    });
  }
}
