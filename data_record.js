import { DataField } from "./data_field.js";

export class DataRecord {
  constructor(io, def) {
    this.globalNum = def.globalMsgNum;
    this.fields = def.fieldDefinitions.map((fieldDef) => {
      const opts = {
        "baseNum": fieldDef.baseNum,
        "size": fieldDef.size,
        "arch": fieldDef.endianness,
      };

      return [fieldDef.fieldDefNum, new DataField(io, opts)];
    });

    if (def.hasDevDefs) {
      console.log("dev fields");
      this.devFields = def.devFieldDefs.map((devFieldDef) => {
        const opts = {
          "baseNum": devFieldDef.fieldDef["baseTypeId"],
          "size": devFieldDef.size,
          "arch": devFieldDef.endianness,
        };

        return [devFieldDef.fieldDef["fieldName"], new DataField(io, opts)];
      });
    }
  }

  valid() {
    return this.fields.filter((field) => {
      return field[1].valid;
    });
  }

  devFields() {
    return this.devFields ? this.devFields : {};
  }
}
