import { ENUMS } from "./enums.js";
import { FIELDS } from "./fields.js";
import { MESSAGES } from "./messages.js";

export class Message {
  constructor(globalMsgNum, definitions) {
    this.globalMsgNum = globalMsgNum;
    this.name = MESSAGES[this.globalMsgNum];

    if (this.name !== undefined) {
      const fields = FIELDS[this.globalMsgNum];
      this.data = definitions
        .map((definition) => {
          return this.makeMessage(fields, definition);
        })
        .flat();
    }
  }

  // TODO: Ensure the definition is valid
  makeMessage(fields, definition) {
    const finished = [];
    definition.valid().map((dataRecords) => {
      const obj = {};
      dataRecords.map((dataRecord) => {
        const data = this.processValue(
          fields[dataRecord[0]],
          dataRecord[1].data,
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

  processValue(type, value) {
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
