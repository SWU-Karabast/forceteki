export { SwuPgnError } from './errors.js';
export * from './generated/types.js';
export { ATTRIBUTES, ZONES, RELATIONS, BLOCK_KINDS, BLOCK_REFERENCE_FIELDS, ERROR_CODES, attributeClass } from './registry.js';
export type { AttributeDef, ZoneDef, RelationDef, BlockKindDef, BlockField, BlockFieldRule, ErrorCodeDef } from './registry.js';
export const VERSION = 'SWU-PGN/0.1';
