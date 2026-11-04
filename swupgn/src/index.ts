export { SwuPgnError } from './errors.js';
export * from './generated/types.js';
export { ATTRIBUTES, ZONES, RELATIONS, BLOCK_KINDS, BLOCK_REFERENCE_FIELDS, ERROR_CODES, attributeClass, isFaceDownAttribute } from './registry.js';
export type { AttributeDef, ZoneDef, RelationDef, BlockKindDef, BlockField, BlockFieldRule, ErrorCodeDef } from './registry.js';
export const VERSION = 'SWU-PGN/0.1';
export { parse, DEFAULT_LIMITS } from './parse.js';
export type { ParseLimits } from './parse.js';
export { serialize } from './serialize.js';
