/**
 * Classifies a behavior-delta audit report (see audit-helper.js) by the rules in
 * long-term-project-docs/lki-redesign-decisions-and-insights.md, D-37 to D-39:
 *
 * - D-37: characteristics of a card that left play during the current action read as last known;
 *   presence (where it is now, whether it is still in play, attached or attacking) reads the present
 * - D-38: a selector's candidate is read as it is now
 * - D-39: a tombstoned identity is read as it is now, rather than throwing
 *
 * Each site is shown with its outcome under those rules, and under the design as it stood before them
 * (every card opted in, location answered from the record, tombstones throwing), which is the baseline
 * the decisions were measured against.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const PRESENCE = new Set(['isInPlay', 'zoneName', 'zone', 'isAttacking', 'isDefending', 'activeAttack', 'isAttached', 'captureZone']);
const IDENTITY = new Set(['inPlayId', 'mostRecentInPlayId']);
const SELECTOR_PATH = /checkCardCondition|cardConditionsAreSatisfied|CardSelector|matchTarget|checkMatch|attackerCondition|targetCondition/i;
const SELECTOR_FN = /^(cardCondition|matchTarget|attackerCondition|targetCondition)$/;

function category(property) {
    if (PRESENCE.has(property)) {
        return 'presence';
    }
    return IDENTITY.has(property) ? 'identity' : 'characteristic';
}

function readSourceLine(root, cache, file, line) {
    try {
        if (!cache.has(file)) {
            cache.set(file, fs.readFileSync(path.join(root, file), 'utf8').split(/\r?\n/));
        }
        return cache.get(file)[line - 1] || '';
    } catch {
        return '';
    }
}

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

function isSelectorCandidate(site) {
    const invokedFromSelector = SELECTOR_PATH.test(Object.keys(site.invokedBy).join(' | ')) || SELECTOR_FN.test(site.cardFn);
    // Only the candidate parameter is exempt (D-38). Other subjects read inside a selector, such as
    // `context.source`, follow D-37.
    return invokedFromSelector && !(/^(context|event|this|thenContext|ifYouDoContext)\b/).test(site.receiver);
}

function outcomeBefore(site) {
    if (site.state === 'tombstoned') {
        return 'throws';
    }
    if (site.state === 'recorded-earlier-identity') {
        return 'live';
    }
    return site.differs > 0 ? 'changes' : 'same';
}

function outcomeUnderRules(site) {
    if (site.candidate || site.state === 'tombstoned' || site.category === 'presence') {
        return 'live';
    }
    if (site.category === 'identity') {
        return 'identity';
    }
    if (site.state === 'recorded-earlier-identity') {
        return 'live';
    }
    return site.differs > 0 ? 'changes' : 'same';
}

function classify(report, root) {
    const cache = new Map();
    return report.sites.map((raw) => {
        const fullLine = readSourceLine(root, cache, raw.file, raw.line);
        const site = {
            ...raw,
            file: raw.file.replace(/\\/g, '/'),
            text: fullLine.trim(),
            category: category(raw.property),
            receiver: receiverOf(fullLine, raw.property, raw.column)
        };
        site.candidate = isSelectorCandidate(site);
        site.before = outcomeBefore(site);
        site.under = outcomeUnderRules(site);
        return site;
    });
}

const cardName = (site) => site.file.split('/').pop()
    .replace(/\.ts$/, '');
const fileSet = (list) => new Set(list.map(cardName));

function describe(site) {
    const example = site.examples.find((e) => JSON.stringify(e.live) !== JSON.stringify(e.lki)) || site.examples[0];
    const arg = Object.keys(site.args)[0] || '';
    return [
        `- \`${site.file.replace(/^server\/game\/cards\//, '')}:${site.line}\` \`${site.receiver}.${site.property}${arg}\` — ${site.state}${site.candidate ? ', selector candidate' : ''}, in \`${site.cardFn}\`; ${site.count} reads, ${site.differs} differing`,
        `  - source: \`${site.text.slice(0, 160)}\``,
        `  - live ${JSON.stringify(example.live).slice(0, 80)}; last known ${JSON.stringify(example.lki).slice(0, 80)}`,
        `  - spec: ${example.spec.slice(0, 150)}`
    ].join('\n');
}

function render(report, sites) {
    const lines = [];
    const section = (title, list, note) => {
        lines.push('', `## ${title} — ${list.length} sites in ${fileSet(list).size} card files`);
        if (note) {
            lines.push('', note);
        }
        lines.push('');
        for (const site of list) {
            lines.push(describe(site));
        }
    };

    lines.push('# LKI behavior-delta audit', '');
    lines.push(`Generated ${report.generatedAt}. ${report.totals.hits} reads at ${sites.length} sites in ${fileSet(sites).size} card files. Audit errors: ${report.auditErrors}. Members not found to instrument: ${report.notWrapped.join(', ') || 'none'}.`);
    lines.push('', `By state: ${Object.entries(report.totals.byState).map(([state, n]) => `${state} ${n}`)
        .join(', ')}.`);

    const brokenBefore = sites.filter((s) => s.before === 'throws' || (s.before === 'changes' && (s.category === 'presence' || s.candidate)));
    lines.push('', '| | Before D-37 to D-39 | Under D-37 to D-39 |', '|---|---|---|');
    lines.push(`| Read throws (tombstoned identity) | ${sites.filter((s) => s.before === 'throws').length} sites | 0 |`);
    lines.push(`| Presence answer changes | ${sites.filter((s) => s.before === 'changes' && s.category === 'presence').length} sites | 0 |`);
    lines.push(`| Selector candidate answer changes | ${sites.filter((s) => s.before === 'changes' && s.candidate && s.category !== 'presence').length} sites | 0 |`);
    lines.push(`| Other characteristic answer changes | ${sites.filter((s) => s.before === 'changes' && !s.candidate && s.category === 'characteristic').length} sites | ${sites.filter((s) => s.under === 'changes').length} sites |`);
    lines.push('', `Card files where the design before D-37 to D-39 throws, or changes a presence or candidate answer: ${fileSet(brokenBefore).size}.`);

    section('A. Throws before D-39 (tombstoned identity)', sites.filter((s) => s.before === 'throws'));
    section('B. Presence answers that change before D-37', sites.filter((s) => s.before === 'changes' && s.category === 'presence'));
    section('C. Candidate answers that change before D-38', sites.filter((s) => s.before === 'changes' && s.candidate && s.category !== 'presence'));
    section('D. Answers that change under D-37 to D-39 — each needs a verdict', sites.filter((s) => s.under === 'changes'),
        'A characteristic of a card that left play during this action, read outside a selector, where last known differs from live.');
    section('E. Earlier identity, differing values — read live under both', sites.filter((s) => s.state === 'recorded-earlier-identity' && s.differs > 0 && s.category !== 'identity'),
        'The card left play and has since become a new copy. Check that the text is about the card where it is now.');
    section('F. Identity reads', sites.filter((s) => s.category === 'identity'));
    lines.push('', `## G. Same answer either way: ${sites.filter((s) => s.before === 'same' && s.under === 'same').length} sites`, '');
    return lines.join('\n');
}

function analyze(reportPath, root, outPath) {
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    const sites = classify(report, root);
    const text = render(report, sites);
    if (outPath) {
        fs.writeFileSync(outPath, text);
    }
    return { report, sites, text };
}

module.exports = { analyze, classify };

if (require.main === module) {
    const root = process.cwd();
    const reportPath = process.argv[2] || path.join(root, 'build', 'lki-audit', 'report.json');
    const { text } = analyze(reportPath, root, null);
    console.log(text);
}
