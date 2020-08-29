const MASKS: { [index: number]: number } = {
  7: 0b1000_0000,
  6: 0b0100_0000,
  5: 0b0010_0000,
  4: 0b0001_0000,
  3: 0b0000_1000,
  2: 0b0000_0100,
  1: 0b0000_0010,
  0: 0b0000_0001,
};

export function readBit(byte: number, bit: number) {
  return (byte & MASKS[bit]) >> bit;
}

export function readBits(byte: number, range: number[]) {
  let mask = 0;
  for (let i: number = range[0]; i >= range[1]; i--) {
    mask += MASKS[i];
  }
  return (byte & mask) >> range[1];
}
