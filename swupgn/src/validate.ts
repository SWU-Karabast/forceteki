import Ajv from 'ajv/dist/2020';
import * as fs from 'fs';
import * as path from 'path';
import type { ConformanceReport, ConformanceIssue } from './types';
import { parse } from './parse';

// Schemas are loaded at runtime from the published swupgn/schema directory.
// This path is relative to the compiled output (build/swupgn/src/validate.js):
// up three levels reaches the repo root, then swupgn/schema. If this module is
// ever extracted to a standalone package, bundle the schema files alongside it
// and adjust this path.
const SCHEMA_DIR = path.resolve(__dirname, '../../../swupgn/schema');
function loadSchema(name: string): object {
    return JSON.parse(fs.readFileSync(path.join(SCHEMA_DIR, name), 'utf8')) as object;
}

// Compile validators once at module load to avoid re-compilation on every call.
const ajv = new Ajv({ allErrors: true, strict: false });
const vHeader = ajv.compile(loadSchema('header.schema.json'));
const vDeck = ajv.compile(loadSchema('deck.schema.json'));
const vEvent = ajv.compile(loadSchema('event.schema.json'));
const vAnn = ajv.compile(loadSchema('annotation.schema.json'));

const KNOWN_EVENT_TYPES = new Set([
    'PLAY','PLAY_EVENT','PLAY_UPGRADE','PLAY_SMUGGLE','DEPLOY_LEADER','ATTACK','PASS',
    'CLAIM_INITIATIVE','CHOICE','MULLIGAN','KEEP_HAND','MODAL_CHOICE','ABILITY_ACTIVATE',
    'DAMAGE','HEAL','DEFEAT','EXHAUST','READY','DRAW','DISCARD','RESOURCE','SHUFFLE',
    'CREATE_TOKEN','MOVE','CAPTURE','RESCUE','TAKE_CONTROL','SHIELD_GAIN','SHIELD_USE',
    'EXPERIENCE_GAIN','STATUS_TOKEN','OVERWHELM','SEARCH','REVEAL','TRIGGER',
    'PHASE_START','PHASE_END','ROUND_START','ROUND_END','GAME_END','INIT',
]);

export function validate(text: string): ConformanceReport {
    const issues: ConformanceIssue[] = [];
    let formatVersion: string | null = null;

    let doc;
    try {
        doc = parse(text);
        formatVersion = doc.header.game ?? null;
    } catch (e) {
        issues.push({ severity: 'error', message: (e as Error).message });
        return { valid: false, formatVersion, issues };
    }

    const headerObj: Record<string, unknown> = {
        Game: doc.header.game, GameId: doc.header.gameId, Date: doc.header.date,
        CardPool: doc.header.cardPool, Engine: doc.header.engine, Seed: doc.header.seed,
        Perspective: doc.header.perspective ?? undefined,
        P1Id: doc.header.p1Id, P2Id: doc.header.p2Id, P1: doc.header.p1, P2: doc.header.p2,
        P1Leader: doc.header.p1Leader, P1Base: doc.header.p1Base,
        P2Leader: doc.header.p2Leader, P2Base: doc.header.p2Base,
        Result: doc.header.result, Reason: doc.header.reason, Rounds: doc.header.rounds,
    };
    if (!vHeader(headerObj)) {
        for (const err of vHeader.errors ?? []) {
            issues.push({ severity: 'error', message: `header${err.instancePath} ${err.message}` });
        }
    }

    for (const d of doc.decks) {
        if (!vDeck(d)) {
            for (const err of vDeck.errors ?? []) {
                issues.push({ severity: 'error', message: `deck ${err.instancePath} ${err.message}` });
            }
        }
    }

    for (const rec of doc.setup) {
        // Cast to a plain record to avoid TypeScript narrowing issues with the
        // discriminated union after passing through the Ajv validator.
        const setupRec = rec as unknown as Record<string, unknown>;
        const seqStr = String(setupRec['seq'] ?? '');
        const tStr = String(setupRec['t'] ?? '');
        if (!vEvent(setupRec)) {
            for (const err of vEvent.errors ?? []) {
                issues.push({ severity: 'error', message: `setup ${seqStr} ${err.instancePath} ${err.message}` });
            }
        }
        if (!KNOWN_EVENT_TYPES.has(tStr)) {
            issues.push({ severity: 'warning', message: `setup ${seqStr} unknown type "${tStr}" (tolerated for forward compatibility)` });
        }
    }

    for (const ev of doc.events) {
        // Cast to a plain record to avoid TypeScript narrowing issues with the
        // discriminated union after passing through the Ajv validator.
        const evRec = ev as unknown as Record<string, unknown>;
        const seqStr = String(evRec['seq'] ?? '');
        const tStr = String(evRec['t'] ?? '');
        if (!vEvent(evRec)) {
            for (const err of vEvent.errors ?? []) {
                issues.push({ severity: 'error', message: `event ${seqStr} ${err.instancePath} ${err.message}` });
            }
        }
        if (!KNOWN_EVENT_TYPES.has(tStr)) {
            issues.push({ severity: 'warning', message: `event ${seqStr} unknown type "${tStr}" (tolerated for forward compatibility)` });
        }
    }

    for (const a of doc.annotations) {
        if (!vAnn(a)) {
            for (const err of vAnn.errors ?? []) {
                issues.push({ severity: 'error', message: `annotation ${err.instancePath} ${err.message}` });
            }
        }
    }

    const hasErrors = issues.some((i) => i.severity === 'error');
    return { valid: !hasErrors, formatVersion, issues };
}
