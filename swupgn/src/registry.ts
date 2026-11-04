import { attributes } from './generated/registry/attributes.js';
import { zones } from './generated/registry/zones.js';
import { relations } from './generated/registry/relations.js';
import { blockKinds } from './generated/registry/blockKinds.js';
import { errorCodes } from './generated/registry/errorCodes.js';

export interface AttributeDef {
    name: string;
    type: string;
    class: 'public' | 'identity';
    on: string[];
    meaning: string;
    cr?: string;
}

export interface ZoneDef {
    name: string;
    meaning: string;
    ownerSees: 'known' | 'count';
    opponentSees: 'count' | 'anonymous' | 'public';
}

export interface RelationDef {
    name: string;
    parent: string;
    meaning: string;
}

/** The block fields a kind's contract governs. `id` and `kind` are always required; `text` and `parent` always optional. */
export type BlockField = 'p' | 'src' | 'targets' | 'options' | 'amount' | 'via' | 'group';

/** The fields that hold entity references, which a redactor may drop ([R-09]). */
export const BLOCK_REFERENCE_FIELDS: readonly BlockField[] = ['src', 'targets', 'options', 'via'];

export interface BlockFieldRule {
    use: 'required' | 'optional';
    meaning?: string;
}

export interface BlockKindDef {
    name: string;
    meaning: string;

    /** The field contract. A field not listed must not appear on a block of this kind. */
    fields: Partial<Record<BlockField, BlockFieldRule>>;
}

export interface ErrorCodeDef {
    code: string;
    severity: 'fatal' | 'error' | 'warning';
    scope?: 'api';
    condition: string;
}

export const ATTRIBUTES: readonly AttributeDef[] = attributes as readonly AttributeDef[];
export const ZONES: readonly ZoneDef[] = zones as readonly ZoneDef[];
export const RELATIONS: readonly RelationDef[] = relations;
export const BLOCK_KINDS: readonly BlockKindDef[] = blockKinds as readonly BlockKindDef[];
export const ERROR_CODES: readonly ErrorCodeDef[] = errorCodes as readonly ErrorCodeDef[];

const ATTRIBUTE_CLASSES: ReadonlyMap<string, 'public' | 'identity'> = new Map(ATTRIBUTES.map((a) => [a.name, a.class]));

/** The visibility class of an attribute. Unregistered names (including every x_ extension) are identity. */
export function attributeClass(name: string): 'public' | 'identity' {
    return ATTRIBUTE_CLASSES.get(name) ?? 'identity';
}
