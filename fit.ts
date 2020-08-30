import { BinaryReader } from "./deps.ts";

import { DefinitionRecord } from "./definition_record.ts";
import { FileHeader } from "./file_header.ts";
import { RecordHeader } from "./record_header.ts";
import { DataRecord } from "./data_record.ts";
import { Message } from "./message.ts";

import { calculateCrc } from "./crc.ts";

export class Fit {
  header: FileHeader;
  messages: Message[] = [];

  constructor(io: BinaryReader) {
    this.header = new FileHeader(io);

    if (!this.validate(io)) {
      console.error("Invalid or malformed .FIT file.");
      Deno.exit(1);
    }

    this.messages = [];
    let finished = [];
    let defs: any = {};
    let devFieldDefs = {};

    try {
      while (io.position < this.header.dataSize + this.header.size) {
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

      for (const [_key, def] of Object.entries(defs)) {
        finished.push(def);
      }

      const groupBy = (xs: any, key: any) => {
        return xs.reduce((rv: any, x: any) => {
          (rv[x[key]] = rv[x[key]] || []).push(x);
          return rv;
        }, {});
      };

      const grouped = groupBy(finished, "globalMsgNum");

      for (const [key, obj] of Object.entries(grouped)) {
        const message = new Message(Number(key), obj);
        if (message.name !== undefined) {
          this.messages.push(message);
        }
      }
    } catch (err) {
      console.error(err);
      Deno.exit(1);
    }
  }

  validate(io: BinaryReader): boolean {
    if (this.header.size === 14) {
      io.seek(0);

      // The header CRC doesn't include bytes 13 and 14, which hold the header CRC...
      const crc = calculateCrc(io, 0, 12);
      if (crc !== this.header.crc) {
        return false;
      }

      io.seek(14);
    }

    const fileCrcPosition = this.header.size + this.header.dataSize;
    io.seek(fileCrcPosition);

    const fileCrc = io.readUint8() + (io.readUint8() << 8);
    const start = this.header.size === 12 ? 0 : this.header.size;
    io.seek(start);

    if (fileCrc !== calculateCrc(io, start, fileCrcPosition)) {
      return false;
    }

    io.seek(this.header.size);

    return true;
  }
}
