export const DATA_TYPES: {
  [index: number]: {
    endianAbility: number;
    baseFieldType: number;
    typeName: string;
    invalidValue: number | bigint;
    size: number;
  };
} = {
  0: {
    endianAbility: 0,
    baseFieldType: 0x00,
    typeName: "enum",
    invalidValue: 0xff,
    size: 1,
  },
  1: {
    endianAbility: 0,
    baseFieldType: 0x01,
    typeName: "sint8",
    invalidValue: 0x7f,
    size: 1,
  },
  2: {
    endianAbility: 0,
    baseFieldType: 0x02,
    typeName: "uint8",
    invalidValue: 0xff,
    size: 1,
  },
  3: {
    endianAbility: 1,
    baseFieldType: 0x83,
    typeName: "sint16",
    invalidValue: 0x7fff,
    size: 2,
  },
  4: {
    endianAbility: 1,
    baseFieldType: 0x84,
    typeName: "uint16",
    invalidValue: 0xffff,
    size: 2,
  },
  5: {
    endianAbility: 1,
    baseFieldType: 0x85,
    typeName: "sint32",
    invalidValue: 0x7fffffff,
    size: 4,
  },
  6: {
    endianAbility: 1,
    baseFieldType: 0x86,
    typeName: "uint32",
    invalidValue: 0xffffffff,
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
    invalidValue: 0xffffffff,
    size: 4,
  },
  9: {
    endianAbility: 1,
    baseFieldType: 0x89,
    typeName: "float64",
    invalidValue: 0xffffffffffffffffn,
    size: 8,
  },
  10: {
    endianAbility: 0,
    baseFieldType: 0x0a,
    typeName: "uint8z",
    invalidValue: 0x00,
    size: 1,
  },
  11: {
    endianAbility: 1,
    baseFieldType: 0x8b,
    typeName: "uint16z",
    invalidValue: 0x0000,
    size: 2,
  },
  12: {
    endianAbility: 1,
    baseFieldType: 0x8c,
    typeName: "uint32z",
    invalidValue: 0x00000000,
    size: 4,
  },
  13: {
    endianAbility: 0,
    baseFieldType: 0x0d,
    typeName: "byte",
    invalidValue: 0xff,
    size: 1,
  },
  14: {
    endianAbility: 1,
    baseFieldType: 0x8e,
    typeName: "sint64",
    invalidValue: 0x7fffffffffffffffn,
    size: 8,
  },
  15: {
    endianAbility: 1,
    baseFieldType: 0x8f,
    typeName: "uint64",
    invalidValue: 0xffffffffffffffffn,
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
