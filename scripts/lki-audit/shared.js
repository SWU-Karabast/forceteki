/**
 * Classification shared by the audit helper, which uses it while the specs run, and the analysis.
 */
'use strict';

const path = require('path');

/**
 * Members that answer where a card is now, which only the current view has under D-37, and which read
 * the present under option (c): the engine's own list, from the build, so the two cannot drift apart,
 * plus `captureZone`, which `Card` has and neither view exposes.
 */
const PRESENCE = new Set([...builtPresenceMembers(), 'captureZone']);

function builtPresenceMembers() {
    const file = path.join(process.cwd(), 'build', 'server', 'game', 'core', 'lki', 'ViewHelpers.js');
    try {
        return Object.keys(require(file).presenceMembers);
    } catch (error) {
        throw new Error(`Cannot read the presence members from ${file}. Run \`npm run build-test\` first.\n${error.message}`);
    }
}

/** Members that name a copy rather than describe it, which the properties object does not carry. */
const IDENTITY = new Set(['inPlayId', 'mostRecentInPlayId']);

/** The expression the member was read from, for example `context.source` or `card`. */
function receiverOf(text, property, column) {
    const needle = `.${property}`;
    let best = -1;
    for (let at = text.indexOf(needle); at !== -1; at = text.indexOf(needle, at + 1)) {
        if (best === -1 || Math.abs(at - (column - 1)) < Math.abs(best - (column - 1))) {
            best = at;
        }
    }
    if (best === -1) {
        return '?';
    }
    const match = (/([\w$]+(?:\??\.[\w$]+|\[[^\]]*\]|\([^)]*\))*)\??$/).exec(text.slice(0, best));
    return match ? match[1] : '?';
}

/**
 * Where a receiver comes from: a context's source or target, an event's card, a plain identifier (a
 * callback parameter or a local), or something else (a helper call, a watcher entry, a relation).
 */
function receiverKind(receiver) {
    if ((/[cC]ontext\??\.source$/).test(receiver)) {
        return 'context.source';
    }
    if ((/[cC]ontext\??\.target$/).test(receiver)) {
        return 'context.target';
    }
    if ((/(?:[eE]vent|\])\??\.card$/).test(receiver)) {
        return 'event.card';
    }
    if ((/^[\w$]+$/).test(receiver)) {
        return 'identifier';
    }
    return 'other';
}

module.exports = { PRESENCE, IDENTITY, receiverOf, receiverKind };
