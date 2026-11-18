/**
 * LKI behavior-delta audit: a jasmine helper loaded by `run.js`. It only observes, and never changes
 * what any getter returns.
 *
 * For every read, from card code (`server/game/cards/**`), of a card that has left play during the
 * current action, it records the member read, the live value returned, and what last known
 * information would have answered: a snapshot taken at the moment the registry writes its record.
 * It also records reads of a card whose record for its current identity was flushed at an earlier action
 * boundary, which D-21's tombstones made throw (the registry no longer keeps tombstones, so the helper
 * tracks these itself), and of a card whose record belongs to an earlier identity (it left play, then
 * moved into a hidden zone or re-entered play).
 *
 * It instruments `Card` members, so it measures card code that reads cards directly. Once card code
 * reads through the card state getter, point it at the properties classes instead.
 *
 * It also measures option (c), the bind-time rule proposed in the 2026-11-17 review: a record answers
 * only a reference bound before the record was written, and anything else reads the present. Each
 * context's `source` and `target` and each event's `card` is stamped when assigned, every committed
 * record is kept with the moment it was committed, and each read is answered under that rule as well.
 * Two variants: "strict", where a reference is bound when the context object holding it was given it,
 * and "lineage", where a copied context or a then/ifYouDo step's context inherits its parent's binding
 * for the same card.
 *
 * See long-term-project-docs/lki-migration-register.md §G.2.
 */
'use strict';

const path = require('path');
const fs = require('fs');
const nodeModule = require('module');
const { PRESENCE, IDENTITY, receiverOf, receiverKind } = require('./shared');

const ROOT = process.cwd();
const OUT = process.env.LKI_AUDIT_OUT || path.join(ROOT, 'build', 'lki-audit', 'report.json');
const requireBuilt = (relativePath) => require(path.join(ROOT, 'build', relativePath));

const { LkiRegistry } = requireBuilt('server/game/core/lki/LkiRegistry.js');
const cardIndex = requireBuilt('server/game/cards/Index.js');
const { AbilityContext } = requireBuilt('server/game/core/ability/AbilityContext.js');
const { TriggeredAbilityContext } = requireBuilt('server/game/core/ability/TriggeredAbilityContext.js');
const { ReplacementEffectContext } = requireBuilt('server/game/core/ability/ReplacementEffectContext.js');
const { CardAbilityStep } = requireBuilt('server/game/core/ability/CardAbilityStep.js');
const { GameEvent } = requireBuilt('server/game/core/event/GameEvent.js');

const GETTERS = [
    'title', 'subtitle', 'type', 'traits', 'aspects', 'keywords', 'cost', 'printedCost', 'unique',
    'controller', 'owner', 'damage', 'remainingHp', 'exhausted', 'upgrades', 'parentCard', 'parentUnit',
    'zoneName', 'zone', 'activeAttack', 'inPlayId', 'mostRecentInPlayId', 'defaultArena', 'captureZone'
];
const ZERO_ARG_METHODS = [
    'isUnit', 'isUpgrade', 'isNonLeaderUnit', 'isLeader', 'isLeaderUnit', 'isBase', 'isEvent', 'isToken',
    'isTokenUnit', 'isTokenUpgrade', 'hasCost', 'canBeExhausted', 'canBeInPlay', 'isAttached', 'isInPlay',
    'isAttacking', 'isDefending', 'isUpgraded', 'hasShield', 'getPower', 'getHp', 'getPrintedPower',
    'getPrintedHp', 'getType', 'isShield', 'isExperience', 'isCreditToken', 'isForceToken'
];
const ARG_METHODS = ['hasSomeTrait', 'hasEveryTrait', 'hasSomeAspect', 'hasEveryAspect', 'hasSomeKeyword'];
const ALL_NAMES = new Set([...GETTERS, ...ZERO_ARG_METHODS, ...ARG_METHODS]);
const CARDS_DIR = `${path.sep}build${path.sep}server${path.sep}game${path.sep}cards${path.sep}`;

let suppress = 0;
let currentSpec = '<none>';
let auditErrors = 0;
const firstAuditErrors = [];
const sites = new Map();
const wrappedNames = {};
const totals = { hits: 0, byState: {} };

function noteAuditError(error) {
    auditErrors++;
    if (firstAuditErrors.length < 10) {
        firstAuditErrors.push(String((error && error.stack) || error).slice(0, 600));
    }
}

function getAudit(registry) {
    if (!registry.__lkiAudit) {
        // pending: eventId -> Map(key -> entry). committed and tombstoned are keyed by card uuid, then identity.
        // history keeps every committed record, in commit order, for option (c): uuid -> identity -> [{ commitSeq, entry }].
        registry.__lkiAudit = { pending: new Map(), committed: new Map(), tombstoned: new Map(), history: new Map() };
    }
    return registry.__lkiAudit;
}

/** Orders bindings and record commits, for option (c). */
let seq = 0;

/** Orders card-code accesses and reads, to tell how recently a card was reached through a binding. */
let tick = 0;

function normalize(value) {
    if (value === undefined) {
        return '<undefined>';
    }
    if (value === null || (typeof value !== 'object' && typeof value !== 'function')) {
        return value;
    }
    if (typeof value === 'function') {
        return '<function>';
    }
    if (value instanceof Set) {
        return [...value].map(normalize).sort();
    }
    if (Array.isArray(value)) {
        return value.map(normalize);
    }

    const ctor = value.constructor && value.constructor.name;
    if (typeof value.internalName === 'string' && typeof value.uuid === 'string') {
        return `card:${value.internalName}@${value.uuid}`;
    }
    if (ctor === 'Player') {
        return `player:${value.name ?? value.id}`;
    }
    if (ctor === 'CardRef') {
        // Compared with the live card a `Card` member returns, so a reference normalizes the same way.
        const card = value.getCardForEngine();
        return `card:${card.internalName}@${card.uuid}`;
    }
    if (ctor && (/Zone$/).test(ctor)) {
        return `zone:${value.name}${value.owner ? '@' + (value.owner.name ?? value.owner.id) : ''}`;
    }
    if (typeof value.name === 'string' && ((ctor && (/Keyword/).test(ctor)) || (ctor === 'Object' && 'value' in value))) {
        return `kw:${value.name}`;
    }
    return `<${ctor || 'object'}>`;
}

/**
 * Whether two normalized results agree. A member with no value is `undefined` on a `Card` and `null` on
 * a properties object (the `cost` of a base, for example), a known difference the sweep accounts for.
 */
function sameResult(a, b) {
    const nullish = (result) => result.ok === null || result.ok === '<undefined>';
    if (a.ok !== undefined && b.ok !== undefined && nullish(a) && nullish(b)) {
        return true;
    }
    if (a.threw !== undefined && b.threw !== undefined) {
        return true;
    }
    return JSON.stringify(a) === JSON.stringify(b);
}

function asList(value) {
    if (value instanceof Set) {
        return [...value];
    }
    return Array.isArray(value) ? value : [value];
}

/** Every instrumented member, read while the card is still in its pre-departure state. */
function snapshot(card) {
    suppress++;
    try {
        const snap = {};
        for (const name of [...GETTERS, ...ZERO_ARG_METHODS]) {
            if (!(name in card)) {
                continue;
            }
            try {
                const raw = card[name];
                const value = ZERO_ARG_METHODS.includes(name) && typeof raw === 'function' ? raw.call(card) : raw;
                snap[name] = { ok: normalize(value) };
            } catch (error) {
                snap[name] = { threw: String((error && error.message) || error).slice(0, 160) };
            }
        }
        try {
            snap.__traits = [...card.traits];
        } catch {
            // not available for this card
        }
        try {
            snap.__aspects = [...card.aspects];
        } catch {
            // not available for this card
        }
        try {
            snap.__keywords = card.keywords.map((keyword) => keyword.name);
        } catch {
            // not available for this card
        }
        return snap;
    } finally {
        suppress--;
    }
}

function lastKnownValue(snap, name, args) {
    if (ARG_METHODS.includes(name)) {
        const wanted = asList(args[0]);
        let pool = snap.__keywords;
        if (name.includes('Trait')) {
            pool = snap.__traits;
        } else if (name.includes('Aspect')) {
            pool = snap.__aspects;
        }
        if (!pool) {
            return { unavailable: true };
        }
        const every = name.startsWith('hasEvery');
        return { ok: every ? wanted.every((item) => pool.includes(item)) : wanted.some((item) => pool.includes(item)) };
    }
    return snap[name] || { unavailable: true };
}

// ---- mirror the registry's record lifecycle, with a fuller snapshot taken at the same moment

const registryProto = LkiRegistry.prototype;
const original = {
    recordPending: registryProto.recordPending,
    commitPending: registryProto.commitPending,
    dropPending: registryProto.dropPending,
    flushRecords: registryProto.flushRecords,
    clearForRollback: registryProto.clearForRollback
};

registryProto.recordPending = function (eventId, card) {
    const result = original.recordPending.call(this, eventId, card);
    try {
        const audit = getAudit(this);
        let forEvent = audit.pending.get(eventId);
        if (!forEvent) {
            forEvent = new Map();
            audit.pending.set(eventId, forEvent);
        }
        const identityId = card.identityId;
        forEvent.set(`${card.uuid}:${identityId}`, {
            uuid: card.uuid, identityId, fromZone: card.zoneName, snap: snapshot(card)
        });
    } catch (error) {
        noteAuditError(error);
    }
    return result;
};

registryProto.commitPending = function (eventId) {
    try {
        const audit = getAudit(this);
        const forEvent = audit.pending.get(eventId);
        if (forEvent) {
            for (const entry of forEvent.values()) {
                let byIdentity = audit.committed.get(entry.uuid);
                if (!byIdentity) {
                    byIdentity = new Map();
                    audit.committed.set(entry.uuid, byIdentity);
                }
                // Same semantics as the registry: an identity keeps the first record it gets.
                if (!byIdentity.has(entry.identityId)) {
                    byIdentity.set(entry.identityId, entry);
                }

                // Option (c) keeps every record, with when it was committed.
                let historyByIdentity = audit.history.get(entry.uuid);
                if (!historyByIdentity) {
                    historyByIdentity = new Map();
                    audit.history.set(entry.uuid, historyByIdentity);
                }
                let records = historyByIdentity.get(entry.identityId);
                if (!records) {
                    records = [];
                    historyByIdentity.set(entry.identityId, records);
                }
                records.push({ commitSeq: ++seq, entry });
            }
            audit.pending.delete(eventId);
        }
    } catch (error) {
        noteAuditError(error);
    }
    return original.commitPending.call(this, eventId);
};

registryProto.dropPending = function (eventIds) {
    try {
        const audit = getAudit(this);
        for (const eventId of eventIds) {
            audit.pending.delete(eventId);
        }
    } catch (error) {
        noteAuditError(error);
    }
    return original.dropPending.call(this, eventIds);
};

registryProto.flushRecords = function () {
    try {
        const audit = getAudit(this);
        for (const [uuid, byIdentity] of audit.committed) {
            let identities = audit.tombstoned.get(uuid);
            if (!identities) {
                identities = new Set();
                audit.tombstoned.set(uuid, identities);
            }
            for (const identityId of byIdentity.keys()) {
                identities.add(identityId);
            }
        }
        audit.committed.clear();
        audit.pending.clear();
        audit.history.clear();
    } catch (error) {
        noteAuditError(error);
    }
    return original.flushRecords.call(this);
};

registryProto.clearForRollback = function () {
    try {
        const audit = getAudit(this);
        audit.committed.clear();
        audit.pending.clear();
        audit.tombstoned.clear();
        audit.history.clear();
    } catch (error) {
        noteAuditError(error);
    }
    return original.clearForRollback.call(this);
};

// ---- call sites

/** Raw V8 call sites, without the cost of formatting (and source-mapping) a stack trace. */
function rawCallSites(omitFn, limit) {
    const previousPrepare = Error.prepareStackTrace;
    const previousLimit = Error.stackTraceLimit;
    Error.prepareStackTrace = (_, callSites) => callSites;
    Error.stackTraceLimit = limit;
    const holder = {};
    Error.captureStackTrace(holder, omitFn);
    const callSites = holder.stack;
    Error.prepareStackTrace = previousPrepare;
    Error.stackTraceLimit = previousLimit;
    return Array.isArray(callSites) ? callSites : [];
}

const sourcePositionCache = new Map();

function toSourcePosition(file, line, column) {
    const key = `${file}:${line}:${column}`;
    if (sourcePositionCache.has(key)) {
        return sourcePositionCache.get(key);
    }
    let result = { file: path.relative(ROOT, file), line, column };
    try {
        const sourceMap = nodeModule.findSourceMap(file);
        const entry = sourceMap && sourceMap.findEntry(line - 1, column - 1);
        if (entry && entry.originalSource) {
            let source = entry.originalSource;
            if (source.startsWith('file://')) {
                source = require('url').fileURLToPath(source);
            }
            if (!path.isAbsolute(source)) {
                source = path.resolve(path.dirname(file), source);
            }
            result = { file: path.relative(ROOT, source), line: entry.originalLine + 1, column: entry.originalColumn + 1 };
        }
    } catch (error) {
        noteAuditError(error);
    }
    sourcePositionCache.set(key, result);
    return result;
}

function frameLabel(callSite) {
    const file = callSite.getFileName() || '<native>';
    const fn = callSite.getFunctionName() || callSite.getMethodName() || '<anonymous>';
    const type = callSite.getTypeName && callSite.getTypeName();
    return `${path.basename(file).replace(/\.js$/, '')}:${type && type !== 'Object' ? type + '.' : ''}${fn}`;
}

// ---- option (c): when each reference was bound

/** The value of each tracked member, with when each card in it was bound: owner -> member -> slot. */
const slots = new WeakMap();

/** The context a context was copied from, or the context of the step that created a then/ifYouDo step. */
const lineage = new WeakMap();

/** The last time card code reached each card through a tracked member. */
const lastAccess = new WeakMap();

function isCardLike(value) {
    return value != null && typeof value === 'object' && typeof value.uuid === 'string' && typeof value.identityId === 'number';
}

/** Card -> { boundAt, identityId } for a card or an array of cards; `null` for anything else. */
function bindingsFor(value) {
    const cards = Array.isArray(value) ? value.filter(isCardLike) : (isCardLike(value) ? [value] : []);
    if (cards.length === 0) {
        return null;
    }
    const boundAt = ++seq;
    const bindings = new Map();
    for (const card of cards) {
        bindings.set(card, { boundAt, identityId: card.identityId });
    }
    return bindings;
}

/** The earliest binding of `card` to `member` along the owner's lineage, for the lineage variant. */
function lineageBinding(owner, member, card, binding) {
    let earliest = binding;
    for (let ancestor = lineage.get(owner); ancestor; ancestor = lineage.get(ancestor)) {
        const inherited = slots.get(ancestor)?.[member]?.bindings?.get(card);
        if (inherited && inherited.identityId === binding.identityId && inherited.boundAt < earliest.boundAt) {
            earliest = inherited;
        }
    }
    return earliest;
}

function noteAccess(owner, member, via, slot, getterFn) {
    try {
        let audited = false;
        for (const card of slot.bindings.keys()) {
            if (subjectState(card)) {
                audited = true;
                break;
            }
        }
        if (!audited) {
            return;
        }
        const caller = rawCallSites(getterFn, 1)[0];
        const file = caller && caller.getFileName();
        if (!file || !file.includes(CARDS_DIR)) {
            return;
        }
        const position = toSourcePosition(file, caller.getLineNumber(), caller.getColumnNumber());
        const fn = caller.getFunctionName() || caller.getMethodName() || '<anonymous>';
        const now = ++tick;
        for (const [card, binding] of slot.bindings) {
            lastAccess.set(card, {
                via, file: position.file, fn, tick: now, identityId: binding.identityId,
                boundAt: binding.boundAt, lineageBoundAt: lineageBinding(owner, member, card, binding).boundAt
            });
        }
    } catch (error) {
        noteAuditError(error);
    }
}

/**
 * Replaces a plain field, assigned in the constructor, with an accessor that stamps each assignment.
 * The value is unchanged and stays on the same object, so nothing the engine compares is affected.
 */
function installTracked(prototype, member, via) {
    const existing = Object.getOwnPropertyDescriptor(prototype, member);
    if (existing) {
        throw new Error(`[lki-audit] ${prototype.constructor.name}.${member} is already defined on the prototype`);
    }

    /** @this {object} the context or event whose member is being read */
    const getter = function () {
        const slot = slots.get(this)?.[member];
        if (!slot) {
            return undefined;
        }
        if (suppress === 0 && slot.bindings) {
            noteAccess(this, member, via, slot, getter);
        }
        return slot.value;
    };
    Object.defineProperty(prototype, member, {
        configurable: true,
        enumerable: true,
        get: getter,
        set(value) {
            let owned = slots.get(this);
            if (!owned) {
                owned = {};
                slots.set(this, owned);
            }
            owned[member] = { value, bindings: bindingsFor(value) };
        }
    });
}

installTracked(AbilityContext.prototype, 'source', 'context.source');
installTracked(AbilityContext.prototype, 'target', 'context.target');
installTracked(GameEvent.prototype, 'card', 'event.card');

for (const contextClass of [AbilityContext, TriggeredAbilityContext, ReplacementEffectContext]) {
    if (!Object.prototype.hasOwnProperty.call(contextClass.prototype, 'copy')) {
        continue;
    }
    const originalCopy = contextClass.prototype.copy;
    contextClass.prototype.copy = function (...args) {
        const copy = originalCopy.apply(this, args);
        lineage.set(copy, this);
        return copy;
    };
}

const originalBuildSubStepContext = CardAbilityStep.prototype.buildSubAbilityStepContext;
CardAbilityStep.prototype.buildSubAbilityStepContext = function (subAbilityStepProps, canBeTriggeredBy, parentContext) {
    const context = originalBuildSubStepContext.call(this, subAbilityStepProps, canBeTriggeredBy, parentContext);
    if (context && parentContext) {
        lineage.set(context, parentContext);
    }
    return context;
};

/**
 * What a read answers under option (c), for a reference bound at `boundAt` to identity `identityId`:
 * the first record of that identity committed after it was bound; failing that, the card as it is now
 * if the identity is still current; and otherwise nothing, as for an orphaned reference.
 */
function optionCAnswer(card, name, args, boundAt, identityId, liveValue) {
    const records = card.game._lkiRegistry?.__lkiAudit?.history.get(card.uuid)?.get(identityId) || [];
    const index = records.findIndex((record) => record.commitSeq > boundAt);
    if (index !== -1) {
        let reason = 'bound before the record';
        if (identityId !== card.identityId) {
            reason = 'bound to an earlier copy';
        } else if (index > 0) {
            reason = 'a later record than the first';
        }
        return { answer: lastKnownValue(records[index].entry.snap, name, args), reason };
    }
    if (identityId === card.identityId) {
        return { answer: liveValue, reason: records.length > 0 ? 'bound after the record' : 'no record' };
    }
    return { answer: { threw: 'orphaned reference' }, reason: 'orphaned' };
}

// ---- the wrapper

function subjectState(card) {
    const registry = card && card.game && card.game._lkiRegistry;
    const audit = registry && registry.__lkiAudit;
    if (!audit || (audit.committed.size === 0 && audit.tombstoned.size === 0)) {
        return null;
    }
    const uuid = card.uuid;
    const identityId = card.identityId;
    const byIdentity = audit.committed.get(uuid);
    if (byIdentity) {
        if (byIdentity.has(identityId)) {
            return { state: 'recorded', entry: byIdentity.get(identityId) };
        }
        let latest = null;
        for (const entry of byIdentity.values()) {
            latest = entry;
        }
        return { state: 'recorded-earlier-identity', entry: latest };
    }
    const tombstoned = audit.tombstoned.get(uuid);
    if (tombstoned && tombstoned.has(identityId)) {
        return { state: 'tombstoned', entry: null };
    }
    return null;
}

/** `Card` members the properties object exposes under another name, or not at all. */
const PROPERTIES_MEMBER = {
    getPower: 'power', getHp: 'hp', getPrintedPower: 'printedPower', getPrintedHp: 'printedHp', getType: 'type',
    inPlayId: null, mostRecentInPlayId: null, captureZone: null
};

/**
 * Asks the built card state getter the question card code just asked the card, through the read named
 * by `read` (`getLastKnownProperties` or `getCurrentProperties`), so the answer can be checked against
 * the one the rules give.
 */
function askGetter(card, read, name, args) {
    const member = name in PROPERTIES_MEMBER ? PROPERTIES_MEMBER[name] : name;
    if (member === null) {
        return { unavailable: true };
    }
    try {
        const properties = card.game.cardStates[read](card);
        const value = properties[member];
        return { ok: normalize(typeof value === 'function' ? value.apply(properties, args) : value) };
    } catch (error) {
        return { threw: String((error && error.message) || error).slice(0, 160) };
    }
}

const sourceLines = new Map();

function sourceLine(file, line) {
    try {
        if (!sourceLines.has(file)) {
            sourceLines.set(file, fs.readFileSync(path.join(ROOT, file), 'utf8').split(/\r?\n/));
        }
        return sourceLines.get(file)[line - 1] || '';
    } catch {
        return '';
    }
}

/**
 * Option (c) for one read: was the receiver reached through a binding, and what does the rule answer?
 *
 * A receiver written as a context's `source` or `target`, or an event's `card`, is bound if card code
 * reached the card through that member just before. A plain identifier is bound if the card was
 * reached through a binding earlier in the same function (a local holding `context.target`, say). Any
 * other receiver is bound if a binding was reached immediately before (a helper that returns
 * `context.target`). Everything else, a selector's candidate among it, is unbound and reads the present.
 */
function evaluateOptionC(card, name, args, position, cardFn, liveValue) {
    const readTick = ++tick;
    const kind = receiverKind(receiverOf(sourceLine(position.file, position.line), name, position.column));
    const access = lastAccess.get(card);
    const ticksAgo = access ? readTick - access.tick : null;

    let bound = false;
    if (access && access.file === position.file) {
        if (kind === 'context.source' || kind === 'context.target' || kind === 'event.card') {
            bound = access.via === kind && ticksAgo <= 3;
        } else if (kind === 'identifier') {
            bound = access.fn === cardFn;
        } else {
            bound = ticksAgo <= 2;
        }
    }

    if (PRESENCE.has(name) || IDENTITY.has(name) || !bound) {
        const reason = PRESENCE.has(name) || IDENTITY.has(name) ? 'presence or identity' : 'unbound';
        return { kind, bound, strict: { answer: liveValue, reason }, lineage: { answer: liveValue, reason } };
    }
    return {
        kind, bound, via: access.via,
        strict: optionCAnswer(card, name, args, access.boundAt, access.identityId, liveValue),
        lineage: optionCAnswer(card, name, args, access.lineageBoundAt, access.identityId, liveValue)
    };
}

function accumulateOptionC(site, optionC, lastKnownAnswer, currentAnswer, liveValue) {
    const stats = site.optionC;
    stats.kinds[optionC.kind] = (stats.kinds[optionC.kind] || 0) + 1;
    if (optionC.bound) {
        stats.bound++;
    }
    let differs = false;
    for (const variant of ['strict', 'lineage']) {
        const { answer, reason } = optionC[variant];
        const counts = stats[variant];
        counts.reasons[reason] = (counts.reasons[reason] || 0) + 1;
        if (answer.unavailable || lastKnownAnswer.unavailable) {
            counts.unavailable++;
            continue;
        }
        counts.matchesLastKnown += sameResult(answer, lastKnownAnswer) ? 1 : 0;
        counts.matchesCurrent += !currentAnswer.unavailable && sameResult(answer, currentAnswer) ? 1 : 0;
        counts.matchesLive += sameResult(answer, liveValue) ? 1 : 0;
        differs = differs || !sameResult(answer, lastKnownAnswer);
    }
    if (differs && stats.examples.length < 4) {
        stats.examples.push({
            spec: currentSpec, kind: optionC.kind, via: optionC.via, live: liveValue, lastKnown: lastKnownAnswer,
            current: currentAnswer, strict: optionC.strict, lineage: optionC.lineage
        });
    }
}

function recordHit(card, name, args, hit, live, threw) {
    const cardFrame = hit.callSites[0];
    const position = toSourcePosition(cardFrame.getFileName(), cardFrame.getLineNumber(), cardFrame.getColumnNumber());
    const cardFn = cardFrame.getFunctionName() || cardFrame.getMethodName() || '<anonymous>';

    // The engine frames that invoked the card callback.
    const invokedBy = [];
    let leftCardCode = false;
    for (let i = 1; i < hit.callSites.length && invokedBy.length < 3; i++) {
        const file = hit.callSites[i].getFileName() || '';
        if (file.includes(CARDS_DIR) && !leftCardCode) {
            continue;
        }
        leftCardCode = true;
        invokedBy.push(frameLabel(hit.callSites[i]));
    }

    const liveValue = threw ? { threw: String((threw && threw.message) || threw).slice(0, 160) } : { ok: normalize(live) };
    const lkiValue = hit.subject.entry ? lastKnownValue(hit.subject.entry.snap, name, args) : { unavailable: true };
    const differs = !lkiValue.unavailable && JSON.stringify(lkiValue) !== JSON.stringify(liveValue);
    const argText = ARG_METHODS.includes(name) ? `(${JSON.stringify(normalize(args[0]))})` : '';

    // What the built getter answers, both ways it can be asked.
    const lastKnownAnswer = askGetter(card, 'getLastKnownProperties', name, args);
    const currentAnswer = askGetter(card, 'getCurrentProperties', name, args);

    // What option (c) answers, by how the receiver was reached.
    const optionC = evaluateOptionC(card, name, args, position, cardFn, liveValue);

    const key = `${position.file}:${position.line}:${position.column}|${name}|${hit.subject.state}`;
    let site = sites.get(key);
    if (!site) {
        const variantStats = () => ({ matchesLastKnown: 0, matchesCurrent: 0, matchesLive: 0, unavailable: 0, reasons: {} });
        site = {
            file: position.file, line: position.line, column: position.column, property: name,
            state: hit.subject.state, cardFn, invokedBy: {}, count: 0, differs: 0, same: 0,
            lkiUnavailable: 0, liveThrew: 0, examples: [], subjects: {}, args: {},
            getter: { lastKnownMatchesLive: 0, lastKnownMatchesLki: 0, currentMatchesLive: 0, notOnSurface: 0, mismatches: [] },
            optionC: { kinds: {}, bound: 0, strict: variantStats(), lineage: variantStats(), examples: [] }
        };
        sites.set(key, site);
    }
    accumulateOptionC(site, optionC, lastKnownAnswer, currentAnswer, liveValue);

    if (lastKnownAnswer.unavailable) {
        site.getter.notOnSurface++;
    } else {
        site.getter.lastKnownMatchesLive += sameResult(lastKnownAnswer, liveValue) ? 1 : 0;
        site.getter.lastKnownMatchesLki += !lkiValue.unavailable && sameResult(lastKnownAnswer, lkiValue) ? 1 : 0;
        site.getter.currentMatchesLive += sameResult(currentAnswer, liveValue) ? 1 : 0;
        if (site.getter.mismatches.length < 3 && (!sameResult(lastKnownAnswer, liveValue) || !sameResult(currentAnswer, liveValue))) {
            site.getter.mismatches.push({ spec: currentSpec, live: liveValue, lki: lkiValue, lastKnown: lastKnownAnswer, current: currentAnswer });
        }
    }

    site.count++;
    totals.hits++;
    totals.byState[hit.subject.state] = (totals.byState[hit.subject.state] || 0) + 1;
    if (lkiValue.unavailable) {
        site.lkiUnavailable++;
    } else if (differs) {
        site.differs++;
    } else {
        site.same++;
    }
    if (threw) {
        site.liveThrew++;
    }

    const via = invokedBy.join(' < ');
    site.invokedBy[via] = (site.invokedBy[via] || 0) + 1;
    const subject = `${card.internalName}${hit.subject.entry ? ` (left ${hit.subject.entry.fromZone})` : ''}`;
    site.subjects[subject] = (site.subjects[subject] || 0) + 1;
    if (argText) {
        site.args[argText] = (site.args[argText] || 0) + 1;
    }
    if (site.examples.length < 3 && (differs || site.examples.length === 0)) {
        site.examples.push({ spec: currentSpec, live: liveValue, lki: lkiValue, arg: argText || undefined });
    }
}

function makeWrapper(originalFn, name, kind) {
    /** @this {object} the card whose member is being read */
    const wrapper = function (...args) {
        let hit = null;
        if (suppress === 0) {
            try {
                const subject = subjectState(this);
                if (subject) {
                    const caller = rawCallSites(wrapper, 1)[0];
                    const file = caller && caller.getFileName();
                    if (file && file.includes(CARDS_DIR)) {
                        hit = { subject, callSites: rawCallSites(wrapper, 14) };
                    }
                }
            } catch (error) {
                noteAuditError(error);
            }
        }

        if (!hit) {
            return kind === 'get' ? originalFn.call(this) : originalFn.apply(this, args);
        }

        let live;
        let threw = null;
        try {
            live = kind === 'get' ? originalFn.call(this) : originalFn.apply(this, args);
        } catch (error) {
            threw = error;
        }

        suppress++;
        try {
            recordHit(this, name, args, hit, live, threw);
        } catch (error) {
            noteAuditError(error);
        } finally {
            suppress--;
        }

        if (threw) {
            throw threw;
        }
        return live;
    };
    return wrapper;
}

const wrappedPrototypes = new WeakSet();

function wrapPrototypeChain(prototype) {
    let current = prototype;
    while (current && current !== Object.prototype) {
        if (!wrappedPrototypes.has(current)) {
            wrappedPrototypes.add(current);
            for (const name of ALL_NAMES) {
                const descriptor = Object.getOwnPropertyDescriptor(current, name);
                if (!descriptor || !descriptor.configurable) {
                    continue;
                }
                if (descriptor.get) {
                    Object.defineProperty(current, name, { ...descriptor, get: makeWrapper(descriptor.get, name, 'get') });
                    wrappedNames[name] = (wrappedNames[name] || 0) + 1;
                } else if (typeof descriptor.value === 'function') {
                    Object.defineProperty(current, name, { ...descriptor, value: makeWrapper(descriptor.value, name, 'method') });
                    wrappedNames[name] = (wrappedNames[name] || 0) + 1;
                }
            }
        }
        current = Object.getPrototypeOf(current);
    }
}

for (const cardClass of cardIndex.cards.values()) {
    wrapPrototypeChain(cardClass.prototype);
}
for (const cardClass of cardIndex.overrideNotImplementedCards.values()) {
    wrapPrototypeChain(cardClass.prototype);
}

jasmine.getEnv().addReporter({
    specStarted: (result) => {
        currentSpec = result.fullName;
    },
    jasmineDone: () => {
        const report = {
            generatedAt: new Date().toISOString(),
            totals,
            auditErrors,
            firstAuditErrors,
            wrappedNames,
            notWrapped: [...ALL_NAMES].filter((name) => !wrappedNames[name]),
            sites: [...sites.values()].sort((a, b) => b.count - a.count)
        };
        fs.mkdirSync(path.dirname(OUT), { recursive: true });
        fs.writeFileSync(OUT, JSON.stringify(report, null, 1));
        console.log(`\n[lki-audit] ${totals.hits} reads at ${sites.size} sites; audit errors: ${auditErrors}; report: ${OUT}`);
    }
});
