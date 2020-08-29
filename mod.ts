import { BinaryReader } from "./deps.ts";

import { Activity } from "./activity.ts";
import { Fit } from "./fit.ts";

async function main(): Promise<void> {
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
