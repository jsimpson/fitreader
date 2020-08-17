export class DevFieldDefinition {
  constructor(io, devFieldDefs) {
    this.fieldNum = io.readUint8();
    this.size = io.readUint8();
    this.devDataIndex = io.readUint8();
    this.fieldDef = devFieldDefs[this.devDataIndex];
  }
}
