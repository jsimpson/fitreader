import { DefinitionRecord } from "./definition_record.js";
import { FileHeader } from "./file_header.js";
import { RecordHeader } from "./record_header.js";
import { DataRecord } from "./data_record.js";
import { Message } from "./message.js";

export class Fit {
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
