# FitReader

### This is a work in progress

This is a JavaScript/Deno library that is largely a port of the Ruby [fitreader](https://github.com/richardbrodie/fitreader) library. It is capable of parsing and decoding .FIT files, which are a binary data format used by GPS devices and various sensors. It should be noted, it has **only** been tested and proven to support _my_ Garmin Venu .FIT files. YMMV.

It has a very small API footprint, exposing a single class which is capable of handling all of the processing.

## Usage

See [mod.js](mod.js):

```javascript
// runner.js
import { BinaryReader } from "https://deno.land/x/binary_reader@v0.1.4/mod.ts";

import { Fit } from "./fit.js";

const filename = Deno.args[0];
const file = Deno.openSync(filename);
const buf = Deno.readAllSync(file);
Deno.close(file.rid);

const io = new BinaryReader(buf);
const fit = new Fit(io);

console.log({ fit });
```

```bash
$  deno run --allow-read mod.js some-fit-file.fit
{
  fit: Fit {
    header: FileHeader {
      size: 14,
      protocolVersion: 16,
      profileVersion: 2133,
      dataSize: 53578,
      dataType: Uint8Array(4) [ 46, 70, 73, 84 ],
      crc: 22098
    },
    messages: [
      Message { globalMsgNum: "0",   name: "fileId",         data: [Array] },
      Message { globalMsgNum: "2",   name: "deviceSettings", data: [Array] },
      Message { globalMsgNum: "3",   name: "userProfile",    data: [Array] },
      Message { globalMsgNum: "7",   name: "zonesTarget",    data: [Array] },
      Message { globalMsgNum: "12",  name: "sport",          data: [Array] },
      Message { globalMsgNum: "18",  name: "session",        data: [Array] },
      Message { globalMsgNum: "19",  name: "lap",            data: [Array] },
      Message { globalMsgNum: "20",  name: "record",         data: [Array] },
      Message { globalMsgNum: "21",  name: "event",          data: [Array] },
      Message { globalMsgNum: "22",  name: "source",         data: [Array] },
      Message { globalMsgNum: "23",  name: "deviceInfo",     data: [Array] },
      Message { globalMsgNum: "34",  name: "activity",       data: [Array] },
      Message { globalMsgNum: "49",  name: "fileCreator",    data: [Array] },
      Message { globalMsgNum: "147", name: "sensorInfo",     data: [Array] }
    ]
  }
}
```
