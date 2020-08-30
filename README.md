# FitReader

### This is a work in progress

This is a Deno library that is largely a port of the Ruby [fitreader](https://github.com/richardbrodie/fitreader) library. It is capable of parsing and decoding .FIT files, which are a binary data format used by GPS devices and various sensors. It should be noted, it has **only** been tested and proven to support _my_ Garmin Venu .FIT files and a few .FTI files that I found in other repositories. YMMV.

It has a very small API footprint, exposing a single class which is capable of handling all of the processing.

## Usage

See [mod.ts](mod.ts):

```typescript
// runner.ts
import { BinaryReader } from "https://deno.land/x/binary_reader@v0.1.4/mod.ts";

import { Fit } from "./fit.ts";

const filename = Deno.args[0];
const file = Deno.openSync(filename);
const buf = Deno.readAllSync(file);
Deno.close(file.rid);

const io = new BinaryReader(buf);
const fit = new Fit(io);
console.log(fit);
```

```bash
$  deno run --allow-read runner.ts some-fit-file.fit
```
