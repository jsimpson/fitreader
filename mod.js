import { BinaryReader } from "./deps.ts";

import { Activity } from "./activity.js";
import { Fit } from "./fit.js";

async function main() {
  const filename = Deno.args[0];
  const file = Deno.openSync(filename);
  const buf = Deno.readAllSync(file);
  Deno.close(file.rid);

  const io = new BinaryReader(buf);
  const fit = new Fit(io);
  const activity = new Activity(fit);

  await activity.dump();
}

if (import.meta.main) {
  main();
}
