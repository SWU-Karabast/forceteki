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

    /** Whether a redactor keeps it on an anonymous entity ([R-02], [R-05], [R-07]). Absent means false. */
    faceDown?: boolean;
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

/** The block fields a kind's contract governs. `id` and `kind` are always required; `text` and `parent` are always allowed, and `text` is required only where a contract says so. */
export type BlockField = 'p' | 'src' | 'targets' | 'options' | 'amount' | 'via' | 'group' | 'text';

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

/** The header tags SPEC §5.1 and §5.2 define, in canonical order (§5.4). Every other tag is an extension or unknown. */
export const HEADER_TAGS: readonly string[] = [
    'Game', 'Visibility', 'Steps',
    'GameId', 'Date', 'EndDate', 'CardPool', 'Engine', 'P1Id', 'P2Id', 'P1', 'P2', 'Result', 'Reason',
    'Rounds', 'Format', 'Match', 'GameNumber', 'Undos', 'P1Leader', 'P2Leader', 'P1Base', 'P2Base',
    'Seed', 'WriterRevision', 'WriterErrors',
];

const REGISTERED_TAGS: ReadonlySet<string> = new Set(HEADER_TAGS);

/** Whether a header tag is one SPEC §5.1 or §5.2 defines. Extension (`X…`) and unknown tags are not. */
export function isRegisteredHeaderTag(tag: string): boolean {
    return REGISTERED_TAGS.has(tag);
}

const ATTRIBUTE_CLASSES: ReadonlyMap<string, 'public' | 'identity'> = new Map(ATTRIBUTES.map((a) => [a.name, a.class]));

/** Whether an attribute name is in the attribute registry. Every `x_` extension and every unknown name is not. */
export function isRegisteredAttribute(name: string): boolean {
    return ATTRIBUTE_CLASSES.has(name);
}

const FACE_DOWN: ReadonlySet<string> = new Set(ATTRIBUTES.filter((a) => a.faceDown === true).map((a) => a.name));

/** Whether an attribute is kept on an anonymous entity. Only registered attributes marked faceDown are. */
export function isFaceDownAttribute(name: string): boolean {
    return FACE_DOWN.has(name);
}

/** The visibility class of an attribute. Unregistered names (including every x_ extension) are identity. */
export function attributeClass(name: string): 'public' | 'identity' {
    return ATTRIBUTE_CLASSES.get(name) ?? 'identity';
}
