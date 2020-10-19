import { BinaryReader } from "./deps.ts";
import { DataField } from "./data_field.ts";
import { DefinitionRecord } from "./definition_record.ts";
import { FieldDefinition } from "./field_definition.ts";

type Field = [number, DataField];
type Fields = Field[];

export interface DataRecord {
  globalMsgNum: number;
  fields: Fields;
}

export function dataRecord(
  io: BinaryReader,
  def: DefinitionRecord,
): DataRecord {
  return {
    globalMsgNum: def.globalMsgNum,
    fields: def.fieldDefinitions.map((fieldDef: FieldDefinition) => {
      const opts = {
        baseNum: fieldDef.baseNum,
        size: fieldDef.size,
        arch: fieldDef.endianness,
      };

      return [fieldDef.fieldDefNum, new DataField(io, opts)];
    }),
  };
}

export function valid(dataRecord: DataRecord): Fields {
  return dataRecord.fields.filter((field: Field) => {
    if (field[1].valid) {
      return field;
    }
  });
}
