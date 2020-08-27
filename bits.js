const MASKS = {
  7: 0b1000_0000,
  6: 0b0100_0000,
  5: 0b0010_0000,
  4: 0b0001_0000,
  3: 0b0000_1000,
  2: 0b0000_0100,
  1: 0b0000_0010,
  0: 0b0000_0001,
};

export function readBit(byte, bit) {
  return (byte & MASKS[bit]) >> bit;
}

export function readBits(byte, range) {
  let mask = 0;
  for (let i = range[0]; i >= range[1]; i--) {
    mask += MASKS[i];
  }
  return (byte & mask) >> range[1];
}
