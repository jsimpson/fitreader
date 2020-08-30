import { ENUMS } from "./enums.ts";
import { FIELDS } from "./fields.ts";
import { MESSAGES } from "./messages.ts";

import { DefinitionRecord } from "./definition_record.js";

export class Message {
  globalMsgNum: number;
  name: string;
  data: any;

  constructor(globalMsgNum: number, definitions: any) {
    this.globalMsgNum = globalMsgNum;
    this.name = MESSAGES[this.globalMsgNum];

    if (this.name !== undefined) {
      const fields = FIELDS[this.globalMsgNum];
      this.data = definitions
        .map((definition: DefinitionRecord) => {
          return this.makeMessage(fields, definition);
        })
        .flat();
    }
  }

  // TODO: Ensure the definition is valid
  makeMessage(fields: any, definition: any): any {
    const finished: any = [];
    definition.valid().map((dataRecords: any) => {
      const obj: any = {};
      dataRecords.map((dataRecord: any) => {
        const data = this.processValue(
          fields[dataRecord[0]],
          dataRecord[1].data
        );
        obj[data[0]] = data[1];
      });
      finished.push(obj);
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
    return finished;
  }

  processValue(type: any, value: any): any {
    if (type["type"].substring(0, 4) === "enum") {
      value = ENUMS[type["type"]][value];
    } else if (
      type["type"] === "dateTime" ||
      type["type"] === "localDateTime"
    ) {
      const t = new Date(Date.UTC(1989, 11, 31, 0, 0, 0)).getTime() / 1000;
      const d = new Date(0);
      d.setUTCSeconds(value + t);
      value = d.toISOString();
    } else if (type["type"] === "coordinates") {
      value *= 180.0 / 2 ** 31;
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
