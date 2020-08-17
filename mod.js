import { BinaryReader } from "https://deno.land/x/binary_reader@v0.1.2/mod.ts";
import { ENUMS } from "./enums.js";
import { FIELDS } from "./fields.js";
import { MESSAGES } from "./messages.js";

const TYPES = {
  0: {
    endianAbility: 0,
    baseFieldType: 0x00,
    typeName: "enum",
    invalidValue: 0xFF,
    size: 1,
  },
  1: {
    endianAbility: 0,
    baseFieldType: 0x01,
    typeName: "sint8",
    invalidValue: 0x7F,
    size: 1,
  },
  2: {
    endianAbility: 0,
    baseFieldType: 0x02,
    typeName: "uint8",
    invalidValue: 0xFF,
    size: 1,
  },
  3: {
    endianAbility: 1,
    baseFieldType: 0x83,
    typeName: "sint16",
    invalidValue: 0x7FFF,
    size: 2,
  },
  4: {
    endianAbility: 1,
    baseFieldType: 0x84,
    typeName: "uint16",
    invalidValue: 0xFFFF,
    size: 2,
  },
  5: {
    endianAbility: 1,
    baseFieldType: 0x85,
    typeName: "sint32",
    invalidValue: 0x7FFFFFFF,
    size: 4,
  },
  6: {
    endianAbility: 1,
    baseFieldType: 0x86,
    typeName: "uint32",
    invalidValue: 0xFFFFFFFF,
    size: 4,
  },
  7: {
    endianAbility: 0,
    baseFieldType: 0x07,
    typeName: "string",
    invalidValue: 0x00,
    size: 1,
  },
  8: {
    endianAbility: 1,
    baseFieldType: 0x88,
    typeName: "float32",
    invalidValue: 0xFFFFFFFF,
    size: 4,
  },
  9: {
    endianAbility: 1,
    baseFieldType: 0x89,
    typeName: "float64",
    invalidValue: 0xFFFFFFFFFFFFFFFF,
    size: 8,
  },
  10: {
    endianAbility: 0,
    baseFieldType: 0x0A,
    typeName: "uint8z",
    invalidValue: 0x00,
    size: 1,
  },
  11: {
    endianAbility: 1,
    baseFieldType: 0x8B,
    typeName: "uint16z",
    invalidValue: 0x0000,
    size: 2,
  },
  12: {
    endianAbility: 1,
    baseFieldType: 0x8C,
    typeName: "uint32z",
    invalidValue: 0x00000000,
    size: 4,
  },
  13: {
    endianAbility: 0,
    baseFieldType: 0x0D,
    typeName: "byte",
    invalidValue: 0xFF,
    size: 1,
  },
  14: {
    endianAbility: 1,
    baseFieldType: 0x8E,
    typeName: "sint64",
    invalidValue: 0x7FFFFFFFFFFFFFFF,
    size: 8,
  },
  15: {
    endianAbility: 1,
    baseFieldType: 0x8F,
    typeName: "uint64",
    invalidValue: 0xFFFFFFFFFFFFFFFF,
    size: 8,
  },
  16: {
    endianAbility: 1,
    baseFieldType: 0x90,
    typeName: "uint64z",
    invalidValue: 0x0000000000000000,
    size: 8,
  },
};

const MASKS = {
  7: 0b10000000,
  6: 0b01000000,
  5: 0b00100000,
  4: 0b00010000,
  3: 0b00001000,
  2: 0b00000100,
  1: 0b00000010,
  0: 0b00000001,
};

function readBit(byte, bit) {
  return (byte & MASKS[bit]) >> bit;
}

function readBits(byte, range) {
  let mask = 0;
  for (let i = range[0]; i >= range[1]; i--) {
    mask += MASKS[i];
  }
  return (byte & mask) >> range[1];
}

function main() {
  const filename = Deno.args[0];
  const file = Deno.openSync(filename);
  const buf = Deno.readAllSync(file);
  Deno.close(file.rid);

  const io = new BinaryReader(buf);
  const fit = new Fit(io);

  console.log({ fit });
}

class FileHeader {
  constructor(io) {
    this.size = io.readUint8();
    this.protocolVersion = io.readUint8();
    this.profileVersion = io.readUint16(true);
    this.dataSize = io.readUint32(true);

    this.dataType = new Uint8Array(4);
    this.dataType[0] = io.readUint8();
    this.dataType[1] = io.readUint8();
    this.dataType[2] = io.readUint8();
    this.dataType[3] = io.readUint8();

    this.crc = io.readUint16(true);
  }
}

class FieldDefinition {
  constructor(io) {
    this.fieldDefNum = io.readUint8();
    this.size = io.readUint8();
    const byte = io.readUint8();
    this.endianness = readBit(byte, 7);
    this.baseNum = readBits(byte, [4, 0]);
  }
}

class DevFieldDefinition {
  constructor(io, devFieldDefs) {
    this.fieldNum = io.readUint8();
    this.size = io.readUint8();
    this.devDataIndex = io.readUint8();
    this.fieldDef = devFieldDefs[this.devDataIndex];
  }
}

class DefinitionRecord {
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

class RecordHeader {
  constructor(io) {
    const byte = io.readUint8();

    this.headerType = readBit(byte, 7);
    if (this.headerType === 0) {
      this.messageType = readBit(byte, 6);
      this.messageTypeSpecific = readBit(byte, 5);
      this.reserved = readBit(byte, 4);
      this.localMesssageType = readBits(byte, [3, 0]);
    } else {
      this.localMesssageType = readBits(byte, [6, 5]);
      this.timeOffset = readBits(byte, [4, 0]);
    }
  }

  isDefinition() {
    return (this.headerType === 0) && (this.messageType == 1);
  }

  isData() {
    return (this.headerType === 0) && (this.messageType == 0);
  }

  hasDevDefs() {
    return (this.messageTypeSpecific === 1);
  }

  hasTimestamp() {
    return (this.headerType === 1);
  }
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
    if (this.devFields) {
      return this.devFields;
    } else {
      return {};
    }
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
        } else {
          console.log("not def, not data, not timestamp");
          Deno.exit(1);
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

main();
