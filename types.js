export const TYPES = {
  0: {
    endianAbility: 0,
    baseFieldType: 0x00,
    typeName: "enum",
    invalidValue: 0xFF,
    size: 1,
  },
  1: {
    endianAbility: 0,
    baseFieldType: 0x01,
    typeName: "sint8",
    invalidValue: 0x7F,
    size: 1,
  },
  2: {
    endianAbility: 0,
    baseFieldType: 0x02,
    typeName: "uint8",
    invalidValue: 0xFF,
    size: 1,
  },
  3: {
    endianAbility: 1,
    baseFieldType: 0x83,
    typeName: "sint16",
    invalidValue: 0x7FFF,
    size: 2,
  },
  4: {
    endianAbility: 1,
    baseFieldType: 0x84,
    typeName: "uint16",
    invalidValue: 0xFFFF,
    size: 2,
  },
  5: {
    endianAbility: 1,
    baseFieldType: 0x85,
    typeName: "sint32",
    invalidValue: 0x7FFFFFFF,
    size: 4,
  },
  6: {
    endianAbility: 1,
    baseFieldType: 0x86,
    typeName: "uint32",
    invalidValue: 0xFFFFFFFF,
    size: 4,
  },
  7: {
    endianAbility: 0,
    baseFieldType: 0x07,
    typeName: "string",
    invalidValue: 0x00,
    size: 1,
  },
  8: {
    endianAbility: 1,
    baseFieldType: 0x88,
    typeName: "float32",
    invalidValue: 0xFFFFFFFF,
    size: 4,
  },
  9: {
    endianAbility: 1,
    baseFieldType: 0x89,
    typeName: "float64",
    invalidValue: 0xFFFFFFFFFFFFFFFF,
    size: 8,
  },
  10: {
    endianAbility: 0,
    baseFieldType: 0x0A,
    typeName: "uint8z",
    invalidValue: 0x00,
    size: 1,
  },
  11: {
    endianAbility: 1,
    baseFieldType: 0x8B,
    typeName: "uint16z",
    invalidValue: 0x0000,
    size: 2,
  },
  12: {
    endianAbility: 1,
    baseFieldType: 0x8C,
    typeName: "uint32z",
    invalidValue: 0x00000000,
    size: 4,
  },
  13: {
    endianAbility: 0,
    baseFieldType: 0x0D,
    typeName: "byte",
    invalidValue: 0xFF,
    size: 1,
  },
  14: {
    endianAbility: 1,
    baseFieldType: 0x8E,
    typeName: "sint64",
    invalidValue: 0x7FFFFFFFFFFFFFFF,
    size: 8,
  },
  15: {
    endianAbility: 1,
    baseFieldType: 0x8F,
    typeName: "uint64",
    invalidValue: 0xFFFFFFFFFFFFFFFF,
    size: 8,
  },
  16: {
    endianAbility: 1,
    baseFieldType: 0x90,
    typeName: "uint64z",
    invalidValue: 0x0000000000000000,
    size: 8,
  },
};
