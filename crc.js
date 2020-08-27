export function calculateCrc(io, start, end) {
  const crcTable = [
    0x0000,
    0xcc01,
    0xd801,
    0x1400,
    0xf001,
    0x3c00,
    0x2800,
    0xe401,
    0xa001,
    0x6c00,
    0x7800,
    0xb401,
    0x5000,
    0x9c01,
    0x8801,
    0x4400,
  ];

  let crc = 0;

  // Copied from the FIT SDK
  for (let i = start; i < end; i++) {
    const byte = io.readUint8();

    let tmp = crcTable[crc & 0xf];

    crc = (crc >> 4) & 0x0fff;
    crc = crc ^ tmp ^ crcTable[byte & 0xf];

    tmp = crcTable[crc & 0xf];

    crc = (crc >> 4) & 0x0fff;
    crc = crc ^ tmp ^ crcTable[(byte >> 4) & 0xf];
  }

  return crc;
}
