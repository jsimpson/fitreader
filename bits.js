const MASKS = {
  7: 0b10000000,
  6: 0b01000000,
  5: 0b00100000,
  4: 0b00010000,
  3: 0b00001000,
  2: 0b00000100,
  1: 0b00000010,
  0: 0b00000001,
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
