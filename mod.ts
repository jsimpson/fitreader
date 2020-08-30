import { BinaryReader } from "./deps.ts";

import { Fit } from "./fit.ts";

function main(): void {
  const filename = Deno.args[0];
  const file = Deno.openSync(filename);
  const buf = Deno.readAllSync(file);
  Deno.close(file.rid);

  const io = new BinaryReader(buf);
  const fit = new Fit(io);

  console.log(fit);
}

if (import.meta.main) {
  main();
}
