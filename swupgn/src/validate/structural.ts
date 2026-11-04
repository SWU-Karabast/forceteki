import type { ErrorObject } from 'ajv';
import { SwuPgnError } from '../errors.js';
import { applyRecord, emptyBoard } from '../apply.js';
import type { Board, SwuPgnFile, SwuRecord } from '../generated/types.js';
import type { FileLines } from '../parse.js';
import { BLOCK_KINDS, RELATIONS, ZONES } from '../registry.js';
import type { Collector } from './issues.js';

/** Checks one value against a `$defs` entry of the schema. Supplied by the entry, which is the only place ajv loads. */
export type SchemaCheck = (def: string, value: unknown) => ErrorObject[];

const RECORD_DEFS: Readonly<Record<string, string>> = {
    create: 'create', set: 'set', remove: 'remove', reveal: 'reveal', step: 'step', block: 'block',
};
const ZONE_NAMES: ReadonlySet<string> = new Set(ZONES.map((z) => z.name));
const RELATION_NAMES: ReadonlySet<string> = new Set(RELATIONS.map((r) => r.name));
const FIXED_IDS: ReadonlySet<unknown> = new Set(['g', 'p1', 'p2']);
const PARENT_ZONES: ReadonlySet<string> = new Set(['ground', 'space', 'base']);
const REFERENCE_FIELDS = ['src', 'via', 'targets', 'options'];
const BLOCK_ALWAYS = new Set(['t', 'id', 'kind', 'text', 'parent']);

export function isObject(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function has(obj: object, key: string): boolean {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

/** JSON-pointer paths of every number in `value` that is not an integer within +-(2^53-1) ([V-03]). */
export function unsafeNumberPaths(value: unknown, path = '', found: string[] = []): string[] {
    if (typeof value === 'number') {
        if (!Number.isSafeInteger(value)) {
            found.push(path);
        }
    } else if (Array.isArray(value)) {
        value.forEach((v, i) => unsafeNumberPaths(v, `${path}/${i}`, found));
    } else if (isObject(value)) {
        for (const k of Object.keys(value)) {
            unsafeNumberPaths(value[k], `${path}/${k.replace(/~/g, '~0').replace(/\//g, '~1')}`, found);
        }
    }
    return found;
}

function valueAt(root: unknown, pointer: string): unknown {
    let cur: unknown = root;
    for (const raw of pointer.split('/').slice(1)) {
        const key = raw.replace(/~1/g, '/').replace(/~0/g, '~');
        if (cur === null || typeof cur !== 'object' || !has(cur, key)) {
            return undefined;
        }
        cur = (cur as Record<string, unknown>)[key];
    }
    return cur;
}

function describe(errors: ErrorObject[]): string {
    const parts = errors.slice(0, 3).map((e) => `${e.instancePath || '(line)'} ${e.message ?? 'is invalid'}`);
    return parts.join('; ') + (errors.length > 3 ? '; ...' : '');
}

/**
 * Report a line's schema errors as one `schema` issue, leaving out the errors that a more specific
 * code on the same line already covers ([V-15]). `covered` says which errors those are.
 */
export function reportSchema(out: Collector, line: number | undefined, errors: ErrorObject[], value: unknown, covered?: (e: ErrorObject) => boolean): void {
    const unsafe = unsafeNumberPaths(value);
    const rest = errors.filter((e) => !(covered?.(e) ?? false) && !unsafe.includes(e.instancePath));
    if (rest.length > 0) {
        out.add('schema', line, describe(rest));
    }
}

/** Whether a schema error is about `parent` or `rel` being absent, null or unpaired. */
function namesParentRel(e: ErrorObject): boolean {
    const missing = (e.params as { missingProperty?: string }).missingProperty;
    return missing === 'parent' || missing === 'rel' || (/^\/(parent|rel)(\/|$)/).test(e.instancePath);
}

/** Whether `parent` and `rel` are not paired on the record itself ([V-05]); a `set` carries both or neither. */
function unpaired(rec: Record<string, unknown>): boolean {
    if (rec.t === 'create') {
        return (rec.parent !== undefined) !== (rec.rel !== undefined);
    }
    if (rec.t === 'set') {
        return (rec.parent !== undefined && rec.parent !== null && rec.rel === undefined) || (rec.parent === null && rec.rel !== null);
    }
    return false;
}

/** The block-fields rule ([V-16]); returns whether it reported. */
function checkBlockFields(rec: Record<string, unknown>, visibility: string, line: number | undefined, out: Collector): boolean {
    if (typeof rec.kind !== 'string') {
        return false;
    }
    const def = BLOCK_KINDS.find((k) => k.name === rec.kind);
    if (!def) {
        return false;   // an unregistered kind is free ([P-19])
    }
    const problems: string[] = [];
    for (const key of Object.keys(rec)) {
        if (!BLOCK_ALWAYS.has(key) && !has(def.fields, key)) {
            problems.push(`${key} is not in the contract of ${def.name}`);
        }
    }
    for (const [field, rule] of Object.entries(def.fields)) {
        if (rule.use === 'required' && !has(rec, field) && (visibility === 'full' || !REFERENCE_FIELDS.includes(field))) {
            problems.push(`${field} is required by ${def.name}`);
        }
    }
    if (problems.length > 0) {
        out.add('block-fields', line, problems.join('; '));
        return true;
    }
    return false;
}

/** Whether `applyRecord` can be given this record without it misreading the shape of a field it reads. */
function safeToApply(rec: Record<string, unknown>): boolean {
    const idOk = (v: unknown, fixed: boolean) => (typeof v === 'number' && Number.isSafeInteger(v) && v >= 1) || (fixed && typeof v === 'string' && FIXED_IDS.has(v));
    const optAttrs = rec.a === undefined || isObject(rec.a);
    switch (rec.t) {
        case 'create':
            return idOk(rec.e, false) && optAttrs && (rec.parent === undefined || idOk(rec.parent, true)) &&
              (rec.to === undefined || rec.to === 'all' || Array.isArray(rec.to));
        case 'set':
            return idOk(rec.e, true) && optAttrs && (rec.parent === undefined || rec.parent === null || idOk(rec.parent, true));
        case 'remove':
            return idOk(rec.e, true);
        case 'reveal':
            return idOk(rec.e, true) && (rec.to === 'all' || Array.isArray(rec.to));
        default:
            return rec.t === 'step';
    }
}

/**
 * Check every `RECORDS` line: schema, zones and relations, block fields, then apply it and check
 * what applying showed. Returns the game's `result` attribute at the last step, for `result-mismatch`.
 */
export function checkRecords(file: SwuPgnFile, lines: FileLines, out: Collector, schemaCheck: SchemaCheck): { steps: Set<number>; result: unknown } {
    const board: Board = emptyBoard();
    const visibility = file.header.Visibility;
    const steps = new Set<number>();
    const children = new Map<string, Set<string>>();
    const pairBad = new Set<string>();
    const zoneBad = new Set<string>();
    let prevSeq: number | undefined;
    let resultAtStep: unknown;
    let sawStep = false;

    const parentKey = (key: string): string | undefined => {
        const p = Object.prototype.hasOwnProperty.call(board.entities, key) ? board.entities[key].parent : undefined;
        return p === undefined ? undefined : String(p);
    };
    const link = (child: string, parent: string | undefined) => {
        if (parent !== undefined) {
            let set = children.get(parent);
            if (!set) {
                set = new Set();
                children.set(parent, set);
            }
            set.add(child);
        }
    };
    const unlink = (child: string, parent: string | undefined) => {
        if (parent !== undefined) {
            children.get(parent)?.delete(child);
        }
    };

    /** [V-05], [V-14]: report an entity that has just come to break the parent rules, once. */
    const checkEntity = (key: string, line: number | undefined, pairToo: boolean) => {
        const ent = Object.prototype.hasOwnProperty.call(board.entities, key) ? board.entities[key] : undefined;
        if (!ent) {
            pairBad.delete(key);
            zoneBad.delete(key);
            return;
        }
        if (pairToo) {
            const bad = (ent.parent !== undefined) !== (ent.rel !== undefined);
            if (bad && !pairBad.has(key)) {
                out.add('parent-rel', line, `entity ${key} must have parent and rel together`);
            }
            if (bad) {
                pairBad.add(key);
            } else {
                pairBad.delete(key);
            }
        }
        let bad = false;
        if (ent.parent !== undefined) {
            const parent = Object.prototype.hasOwnProperty.call(board.entities, String(ent.parent)) ? board.entities[String(ent.parent)] : undefined;
            bad = !parent || parent.zone === undefined || !PARENT_ZONES.has(parent.zone) ||
              !(ent.zone === parent.zone || (ent.rel === 'captured' && ent.zone === 'captured'));
        }
        if (bad && !zoneBad.has(key)) {
            out.add('parent-rel', line, `entity ${key} must be in the zone of its parent, and its parent must be in ground, space or base`);
        }
        if (bad) {
            zoneBad.add(key);
        } else {
            zoneBad.delete(key);
        }
    };

    file.records.forEach((r, i) => {
        const line = lines.records[i];
        const rec = r as unknown;
        if (!isObject(rec)) {
            out.add('not-object', line, 'a RECORDS line must be a JSON object');
            return;
        }
        const t = rec.t;
        const unsafe = unsafeNumberPaths(rec);
        if (unsafe.length > 0) {
            out.add('number-range', line, `a number is not an integer within +-(2^53-1) at ${unsafe[0] || '/'}`);
        }
        if (typeof t !== 'string') {
            out.add('schema', line, 'a record needs a string t');
            return;
        }
        const def = has(RECORD_DEFS, t) ? RECORD_DEFS[t] : undefined;
        if (!def) {
            if (!t.startsWith('x_')) {
                out.add('unknown-type', line, `record type ${t} is not known to this version`);
            }
            return;
        }

        // Specific codes first; the schema skips what they cover ([V-15]).
        if ((t === 'create' || t === 'set') && typeof rec.zone === 'string' && !ZONE_NAMES.has(rec.zone)) {
            out.add('bad-zone', line, `zone ${rec.zone} is not in the zone registry`);
        }
        if ((t === 'create' || t === 'set') && typeof rec.rel === 'string' && !RELATION_NAMES.has(rec.rel)) {
            out.add('bad-relation', line, `relation ${rec.rel} is not in the relation registry`);
        }
        const blockReported = t === 'block' && checkBlockFields(rec, visibility, line, out);

        if (unpaired(rec)) {
            out.add('parent-rel', line, 'parent and rel must be written together');
        }
        let parentRelAt = out.has('parent-rel', line);

        // Apply, and see what applying shows.
        let applied = false;
        let touched: string | undefined;
        if (safeToApply(rec)) {
            const key = rec.e === undefined ? undefined : String(rec.e);
            try {
                if (t === 'remove' && key !== undefined && (children.get(key)?.size ?? 0) > 0) {
                    out.add('unknown-entity', line, `entity ${key} is the parent of another entity and cannot be removed`);
                } else {
                    const before = key === undefined ? undefined : parentKey(key);
                    applyRecord(board, rec as unknown as SwuRecord, line);
                    applied = true;
                    if (t === 'remove' && key !== undefined) {
                        unlink(key, before);
                        pairBad.delete(key);
                        zoneBad.delete(key);
                    } else if ((t === 'create' || t === 'set') && key !== undefined) {
                        const after = parentKey(key);
                        if (after !== before) {
                            unlink(key, before);
                            link(key, after);
                        }
                        touched = key;
                    }
                }
            } catch (e) {
                if (e instanceof SwuPgnError) {
                    out.add(e.code, line, e.message);
                }   // anything else is a bug in applying, and must not stop validation ([V-02])
            }
        }
        if (touched !== undefined) {
            checkEntity(touched, line, true);
            for (const child of children.get(touched) ?? []) {
                checkEntity(child, line, false);
            }
            parentRelAt = out.has('parent-rel', line);
        }

        const errors = schemaCheck(def, rec);
        if (errors.length > 0) {
            const fixedId = (t === 'remove' || t === 'reveal') && FIXED_IDS.has(rec.e);
            const paired = errors.filter((e) => namesParentRel(e));
            reportSchema(out, line, errors, rec, (e) =>
                (parentRelAt && (paired.includes(e) || (e.keyword === 'if' && paired.length > 0))) ||
                (blockReported && e.keyword === 'additionalProperties') ||
                (fixedId && e.instancePath === '/e'));
        }

        if (t === 'step') {
            sawStep = true;
            if (typeof rec.seq === 'number') {
                const expected = prevSeq === undefined ? 0 : prevSeq + 1;
                if (rec.seq !== expected) {
                    out.add('seq-order', line, `step seq ${rec.seq} where ${expected} was expected`);
                }
                prevSeq = rec.seq;
                steps.add(rec.seq);
            }
            if (applied) {
                resultAtStep = board.entities.g.a.result;
            }
        }
    });
    return { steps, result: sawStep ? resultAtStep : board.entities.g.a.result };
}
