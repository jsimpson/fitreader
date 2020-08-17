import { BinaryReader } from "https://deno.land/x/binary_reader@v0.1.2/mod.ts";

import { ENUMS } from "./enums.js";
import { FIELDS } from "./fields.js";
import { MESSAGES } from "./messages.js";
import { TYPES } from "./types.js";

import { DefinitionRecord } from "./definition_record.js";
import { FileHeader } from "./file_header.js";
import { RecordHeader } from "./record_header.js";

function main() {
  const filename = Deno.args[0];
  const file = Deno.openSync(filename);
  const buf = Deno.readAllSync(file);
  Deno.close(file.rid);

  const io = new BinaryReader(buf);
  const fit = new Fit(io);

  console.log({ fit });
}

class DataField {
  constructor(io, opts = {}) {
    const baseNum = opts["baseNum"];
    const size = opts["size"];
    const arch = opts["arch"];
    const littleEndian = arch === 1;

    const base = TYPES[baseNum];

    const multiples = opts["size"] / base["size"];

    switch (base["typeName"]) {
      case "enum":
      case "byte":
      case "uint8":
      case "uint8z":
        if (multiples > 1) {
          this.data = new Uint8Array(multiples);
          for (let i = 0; i < multiples; i++) {
            this.data[i] = io.readUint8();
          }
        } else {
          this.data = io.readUint8();
        }
        break;
      case "sint8":
        if (multiples > 1) {
          this.data = new Int8Array(multiples);
          for (let i = 0; i < multiples; i++) {
            this.data[i] = io.readInt8();
          }
        } else {
          this.data = io.readInt8();
        }
        break;
      case "uint16":
      case "uint16z":
        if (multiples > 1) {
          this.data = new Uint16Array(multiples);
          for (let i = 0; i < multiples; i++) {
            this.data[i] = io.readUint16(littleEndian);
          }
        } else {
          this.data = io.readUint16(littleEndian);
        }
        break;
      case "sint16":
        if (multiples > 1) {
          this.data = new Int16Array(multiples);
          for (let i = 0; i < multiples; i++) {
            this.data[i] = io.readInt16(littleEndian);
          }
        } else {
          this.data = io.readInt16(littleEndian);
        }
        break;
      case "uint32":
      case "uint32z":
        if (multiples > 1) {
          this.data = new Uint32Array(multiples);
          for (let i = 0; i < multiples; i++) {
            this.data[i] = io.readUint32(littleEndian);
          }
        } else {
          this.data = io.readUint32(littleEndian);
        }
        break;
      case "sint32":
        if (multiples > 1) {
          this.data = new Int32Array(multiples);
          for (let i = 0; i < multiples; i++) {
            this.data[i] = io.readInt32(littleEndian);
          }
        } else {
          this.data = io.readInt32(littleEndian);
        }
        break;
      case "float32":
        if (multiples > 1) {
          this.data = new Float32Array(multiples);
          for (let i = 0; i < multiples; i++) {
            this.data[i] = io.readFloat32(littleEndian);
          }
        } else {
          this.data = io.readFloat32(littleEndian);
        }
        break;
      case "float64":
        if (multiples > 1) {
          this.data = new Float64Array(multiples);
          for (let i = 0; i < multiples; i++) {
            this.data[i] = io.readFloat64(littleEndian);
          }
        } else {
          this.data = io.readFloat64(littleEndian);
        }
        break;
      case "uint64":
      case "uint64z":
        if (multiples > 1) {
          this.data = new Array(multiples);
          for (let i = 0; i < multiples; i++) {
            this.data[i] = io.readBigUint64(littleEndian);
          }
        } else {
          this.data = io.readBigUint64(littleEndian);
        }
        break;
      case "sint64":
        if (multiples > 1) {
          this.data = new Array(multiples);
          for (let i = 0; i < multiples; i++) {
            this.data[i] = io.readBigInt64(littleEndian);
          }
        } else {
          this.data = io.readBigInt64(littleEndian);
        }
        break;
      case "string":
        this.data = io.readString(size);
        break;
      default:
        console.log(`Error reading base type: ${base}`);
        Deno.exit(1);
        break;
    }

    this.valid = this.check(this.data, base["invalidValue"]);
  }

  check(data, invalid) {
    if (Array.isArray(data)) {
      const valid = data.map((d) => {
        return d !== invalid;
      });

      return valid.length > 0;
    }

    return data !== invalid;
  }
}

class DataRecord {
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

class Message {
  constructor(globalMsgNum, definitions) {
    this.globalMsgNum = globalMsgNum;
    this.name = MESSAGES[this.globalMsgNum];

    if (this.name !== undefined) {
      const fields = FIELDS[this.globalMsgNum];
      this.data = definitions.map((definition) => {
        return this.makeMessage(fields, definition);
      });
    }
  }

  // TODO: Ensure the definition is valid
  makeMessage(fields, definition) {
    const processed = definition.valid().map((dataRecords) => {
      return dataRecords.map((dataRecord) => {
        return this.processValue(fields[dataRecord[0]], dataRecord[1].data);
      });
    });

    // TODO: Process events and device info
    switch (this.globalMsgNum) {
      case 21:
        break;
      case 0:
      case 23:
        break;
    }

    // TODO: Process and combine with developer fields
    return processed;
  }

  processValue(type, value) {
    if (type["type"].substring(0, 4) === "enum") {
      value = ENUMS[type["type"]][value];
    } else if (
      (type["type"] === "dateTime") || (type["type"] === "localDateTime")
    ) {
      const t = new Date(Date.UTC(1989, 11, 31, 0, 0, 0)).getTime() / 1000;
      const d = new Date(0);
      d.setUTCSeconds(value + t);
      value = d.toISOString();
    } else if (type["type"] === "coordinates") {
      value *= (180.0 / 2 ** 31);
    }

    if (type["scale"] !== 0) {
      if (Array.isArray(value)) {
        value = value.map((val) => {
          return (val * 1.0) / type["scale"];
        });
      } else {
        value = (value * 1.0) / type["scale"];
      }
    }

    if (type["offset"] !== 0) {
      if (Array.isArray(value)) {
        value = value.map((val) => {
          return val - type["offset"];
        });
      } else {
        value = value - type["offset"];
      }
    }

    return [type["name"], value];
  }
}

class Fit {
  constructor(io) {
    this.header = new FileHeader(io);
    this.messages = [];
    let finished = [];

    try {
      let defs = {};
      let devFieldDefs = {};

      while (io.position < this.header.dataSize + 14) {
        const h = new RecordHeader(io);

        if (h.isDefinition()) {
          let d;

          if (h.hasDevDefs()) {
            d = new DefinitionRecord(io, h.localMesssageType, devFieldDefs);
          } else {
            d = new DefinitionRecord(io, h.localMesssageType);
          }

          if (defs[h.localMesssageType] !== undefined) {
            finished.push(defs[h.localMesssageType]);
          }

          defs[h.localMesssageType] = d;
        } else if (h.isData()) {
          const d = defs[h.localMesssageType];
          const dataRecord = new DataRecord(io, d);

          if (d.globalMsgNum === 206) {
            console.log("dev field, shit");
            // TODO: Implement decoding dev fields
          } else {
            d.dataRecords.push(dataRecord);
          }
        } else if (h.hasTimestamp()) {
          console.log("has timestamp");
        }
      }

      for (const [key, def] of Object.entries(defs)) {
        finished.push(def);
      }

      const groupBy = (xs, key) => {
        return xs.reduce((rv, x) => {
          (rv[x[key]] = rv[x[key]] || []).push(x);
          return rv;
        }, {});
      };

      const grouped = groupBy(finished, "globalMsgNum");

      for (const [key, obj] of Object.entries(grouped)) {
        const message = new Message(key, obj);
        if ((message.name !== undefined) && (obj[0].valid)) {
          this.messages.push(message);
        }
      }
    } catch (err) {
      console.log({ err, finished });
      Deno.exit(1);
    }
  }
}

if (import.meta.main) {
  main();
}
