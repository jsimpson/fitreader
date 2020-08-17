import { BinaryReader } from "https://deno.land/x/binary_reader@v0.1.2/mod.ts";

import { ENUMS } from "./enums.js";
import { FIELDS } from "./fields.js";
import { MESSAGES } from "./messages.js";
import { TYPES } from "./types.js";

import { DefinitionRecord } from "./definition_record.js";
import { FileHeader } from "./file_header.js";
import { RecordHeader } from "./record_header.js";
import { DataRecord } from "./data_record.js";

function main() {
  const filename = Deno.args[0];
  const file = Deno.openSync(filename);
  const buf = Deno.readAllSync(file);
  Deno.close(file.rid);

  const io = new BinaryReader(buf);
  const fit = new Fit(io);

  console.log({ fit });
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
