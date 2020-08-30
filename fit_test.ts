import { BinaryReader } from "./deps.ts";
import { Fit } from "./fit.ts";
import { assertEquals, test } from "./test_deps.ts";

test({
  name: "Properly decodes older .FIT files.",
  fn() {
    const file = Deno.openSync("./fixtures/older-format.fit");
    const buf = Deno.readAllSync(file);
    Deno.close(file.rid);

    const io = new BinaryReader(buf);
    const fit = new Fit(io);

    const header = {
      size: 12,
      protocolVersion: 16,
      profileVersion: 64,
      dataSize: 452611,
      dataType: new Uint8Array([ 46, 70, 73, 84 ]),
    }

    assertEquals(fit.header, header);
    assertEquals(fit.messages.length, 9);

    const MESSAGE_INDEX_LAP = 2;
    const MESSAGE_INDEX_RECORD = 3;

    assertEquals(fit.messages[MESSAGE_INDEX_LAP].name, "lap");
    assertEquals(fit.messages[MESSAGE_INDEX_RECORD].name, "record");
  }
});

test({
  name: "Properly decodes contemporary Garmin .FIT files.",
  fn() {
    const file = Deno.openSync("./fixtures/garmin.fit");
    const buf = Deno.readAllSync(file);
    Deno.close(file.rid);

    const io = new BinaryReader(buf);
    const fit = new Fit(io);

    const header = {
      size: 14,
      protocolVersion: 16,
      profileVersion: 2010,
      dataSize: 191877,
      dataType: new Uint8Array([ 46, 70, 73, 84 ]),
      crc: 36757,
    };

    assertEquals(fit.header, header);
    assertEquals(fit.messages.length, 16);

    const MESSAGE_INDEX_LAP = 6;
    const MESSAGE_INDEX_RECORD = 7;

    assertEquals(fit.messages[MESSAGE_INDEX_LAP].name, "lap");
    assertEquals(fit.messages[MESSAGE_INDEX_RECORD].name, "record");
  }
});

test({
  name: "Properly decodes .FIT files from other-than-Garmin vendors.",
  fn() {
    const file = Deno.openSync("./fixtures/wahoo.fit");
    const buf = Deno.readAllSync(file);
    Deno.close(file.rid);

    const io = new BinaryReader(buf);
    const fit = new Fit(io);

    const header = {
      size: 14,
      protocolVersion: 16,
      profileVersion: 1660,
      dataSize: 21613,
      dataType: new Uint8Array([ 46, 70, 73, 84 ]),
      crc: 17752,
    };

    assertEquals(fit.header, header);
    assertEquals(fit.messages.length, 10);

    const MESSAGE_INDEX_LAP = 3;
    const MESSAGE_INDEX_RECORD = 4;

    assertEquals(fit.messages[MESSAGE_INDEX_LAP].name, "lap");
    assertEquals(fit.messages[MESSAGE_INDEX_RECORD].name, "record");
  }
});
