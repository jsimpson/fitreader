import { ENUMS } from "./enums.ts";
import { Field, FIELDS } from "./fields.ts";
import { MESSAGES } from "./messages.ts";

import { DataField } from "./data_field.ts";
import { DefinitionRecord } from "./definition_record.ts";

export class Message {
  globalMsgNum: number;
  name: string;
  data: { [index: string]: number | string }[] = [];

  constructor(globalMsgNum: number, definitions: DefinitionRecord[]) {
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

  makeMessage(
    fields: { [index: string]: Field },
    definition: DefinitionRecord,
  ): { [index: string]: number | string }[] {
    const finished: { [index: string]: number | string }[] = [];
    definition.valid().map((dataRecords: [number, DataField][]) => {
      const obj: { [indedx: string]: number | string } = {};
      dataRecords.map((dataRecord: [number, DataField]) => {
        const data = this.processValue(
          fields[dataRecord[0]],
          dataRecord[1].data,
        );
        obj[data[0]] = data[1];
      });
      finished.push(obj);
    });

    return finished;
  }

  // deno-lint-ignore no-explicit-any
  processValue(field: Field, value: any): any {
    if (field["type"].substring(0, 4) === "enum") {
      value = ENUMS[field["type"]][value];
    } else if (
      field["type"] === "dateTime" ||
      field["type"] === "localDateTime"
    ) {
      const t = new Date(Date.UTC(1989, 11, 31, 0, 0, 0)).getTime() / 1000;
      const d = new Date(0);
      d.setUTCSeconds(value + t);
      value = d.toISOString();
    } else if (field["type"] === "coordinates") {
      value *= 180.0 / 2 ** 31;
    } else {
      console.log(field["type"]);
    }

    if (field["scale"] !== 0) {
      if (Array.isArray(value)) {
        value = value.map((val) => {
          return (val * 1.0) / field["scale"];
        });
      } else {
        value = (value * 1.0) / field["scale"];
      }
    }

    if (field["offset"] !== 0) {
      if (Array.isArray(value)) {
        value = value.map((val) => {
          return val - field["offset"];
        });
      } else {
        value = value - field["offset"];
      }
    }

    return [field["name"], value];
  }
}
