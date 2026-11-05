/**
 * LKI behavior-delta audit: a jasmine helper loaded by `run.js`. It only observes, and never changes
 * what any getter returns.
 *
 * For every read, from card code (`server/game/cards/**`), of a card that has left play during the
 * current action, it records the member read, the live value returned, and what last known
 * information would have answered: a snapshot taken at the moment the registry writes its record.
 * It also records reads of a card whose current identity has been tombstoned, and of a card whose
 * record belongs to an earlier identity (it left play, then moved into a hidden zone or re-entered
 * play).
 *
 * It instruments `Card` members, so it measures card code that reads cards directly. Once card code
 * reads through the card state getter, point it at the properties classes instead.
 *
 * See long-term-project-docs/lki-migration-register.md §G.2.
 */
'use strict';

const path = require('path');
const fs = require('fs');
const nodeModule = require('module');

const ROOT = process.cwd();
const OUT = process.env.LKI_AUDIT_OUT || path.join(ROOT, 'build', 'lki-audit', 'report.json');
const requireBuilt = (relativePath) => require(path.join(ROOT, 'build', relativePath));

const { LkiRegistry } = requireBuilt('server/game/core/lki/LkiRegistry.js');
const cardIndex = requireBuilt('server/game/cards/Index.js');

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
        registry.__lkiAudit = { pending: new Map(), committed: new Map(), tombstoned: new Map() };
    }
    return registry.__lkiAudit;
}

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
        return `ref:${value.key}`;
    }
    if (ctor && (/Zone$/).test(ctor)) {
        return `zone:${value.name}${value.owner ? '@' + (value.owner.name ?? value.owner.id) : ''}`;
    }
    if (ctor && (/Keyword/).test(ctor) && typeof value.name === 'string') {
        return `kw:${value.name}`;
    }
    return `<${ctor || 'object'}>`;
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
                // Same semantics as the registry: the last commit for an identity wins.
                byIdentity.set(entry.identityId, entry);
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

    const key = `${position.file}:${position.line}:${position.column}|${name}|${hit.subject.state}`;
    let site = sites.get(key);
    if (!site) {
        site = {
            file: position.file, line: position.line, column: position.column, property: name,
            state: hit.subject.state, cardFn, invokedBy: {}, count: 0, differs: 0, same: 0,
            lkiUnavailable: 0, liveThrew: 0, examples: [], subjects: {}, args: {}
        };
        sites.set(key, site);
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
