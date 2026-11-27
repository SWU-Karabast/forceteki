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
const { PRESENCE, IDENTITY, receiverOf } = require('./shared');

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

    const check = checkGetter(sites);
    lines.push('', `## H. The built getter against the rules — ${check.checked} sites checked, ${check.disagreements.length} disagree`, '');
    lines.push('At each read, the audit also asks the built getter the same question: `getCurrentProperties` for a selector candidate (D-38) and for presence, which only the current view has (D-37), and `getLastKnownProperties` otherwise. A candidate, presence, a tombstoned identity and a card that has become a new copy must get the live answer; a characteristic of a card that left play during the action must get the recorded one.', '');
    for (const { site, expected, example } of check.disagreements) {
        lines.push(`- \`${site.file.replace(/^server\/game\/cards\//, '')}:${site.line}\` \`${site.receiver}.${site.property}\` — ${site.state}, expected ${expected}`);
        if (example) {
            lines.push(`  - live ${JSON.stringify(example.live).slice(0, 70)}; last known ${JSON.stringify(example.lki).slice(0, 70)}; getter ${JSON.stringify(example.lastKnown).slice(0, 70)}; present ${JSON.stringify(example.current).slice(0, 70)}`);
        }
    }

    const optionC = checkOptionC(sites);
    lines.push('', `## I. Option (c), the bind-time rule, against D-37 to D-39 — ${optionC.checked} sites checked`, '');
    lines.push('Under option (c) a record answers only a reference bound before the record was written, and anything else reads the present; presence and selector candidates read the present under both. "Strict" binds a reference when the context object holding it was given it; "lineage" lets a copied context or a then/ifYouDo step inherit its parent\'s binding of the same card. Each site below answers differently from the built getter in at least one read.', '');
    for (const variant of ['strict', 'lineage']) {
        lines.push(`- ${variant}: ${optionC[variant].length} sites differ, in ${fileSet(optionC[variant].map((entry) => entry.site)).size} card files. By reason: ${Object.entries(optionC.byReason[variant]).map(([reason, n]) => `${reason} ${n}`)
            .join(', ') || 'none'}.`);
    }
    for (const variant of ['strict', 'lineage']) {
        lines.push('', `### I.${variant === 'strict' ? '1' : '2'} ${variant} — ${optionC[variant].length} sites`, '');
        for (const { site, example, reason } of optionC[variant]) {
            lines.push(`- \`${site.file.replace(/^server\/game\/cards\//, '')}:${site.line}\` \`${site.receiver}.${site.property}\` — ${reason}; ${site.optionC.kinds ? Object.keys(site.optionC.kinds).join('/') : ''} receiver, in \`${site.cardFn}\`; ${site.count} reads`);
            lines.push(`  - source: \`${site.text.slice(0, 150)}\``);
            if (example) {
                lines.push(`  - live ${JSON.stringify(example.live).slice(0, 60)}; built getter ${JSON.stringify(example.lastKnown).slice(0, 60)}; option (c) ${JSON.stringify(example[variant].answer).slice(0, 60)}`);
                lines.push(`  - spec: ${example.spec.slice(0, 150)}`);
            }
        }
    }
    return lines.join('\n');
}

/**
 * Where option (c) answers differently from the built getter. Presence and selector candidates read
 * the present under both rules, so only the remaining characteristic reads can differ.
 */
function checkOptionC(sites) {
    const result = { checked: 0, strict: [], lineage: [], byReason: { strict: {}, lineage: {} } };
    for (const site of sites) {
        const stats = site.optionC;
        if (!stats || site.category !== 'characteristic' || site.candidate) {
            continue;
        }
        result.checked++;
        for (const variant of ['strict', 'lineage']) {
            const counts = stats[variant];
            const asked = site.count - counts.unavailable;
            if (asked === 0 || counts.matchesLastKnown === asked) {
                continue;
            }
            const example = stats.examples.find((candidate) => JSON.stringify(candidate[variant].answer) !== JSON.stringify(candidate.lastKnown));
            const reason = example ? example[variant].reason : Object.keys(counts.reasons)[0];
            result[variant].push({ site, example, reason });
            result.byReason[variant][reason] = (result.byReason[variant][reason] || 0) + 1;
        }
    }
    return result;
}

/** What the rules say the getter must answer at a site, and whether it did at every read there. */
function checkGetter(sites) {
    let checked = 0;
    const disagreements = [];
    for (const site of sites) {
        const getter = site.getter;
        if (!getter || site.category === 'identity') {
            continue;
        }
        const asked = site.count - getter.notOnSurface;
        if (asked === 0) {
            continue;
        }
        checked++;
        let expected;
        let agrees;
        if (site.candidate) {
            expected = 'the live answer from getCurrentProperties';
            agrees = getter.currentMatchesLive === asked;
        } else if (site.category === 'presence' || site.state !== 'recorded') {
            expected = 'the live answer';
            agrees = getter.lastKnownMatchesLive === asked;
        } else {
            expected = 'the recorded answer';
            agrees = getter.lastKnownMatchesLki === asked - site.lkiUnavailable;
        }
        if (!agrees) {
            disagreements.push({ site, expected, example: getter.mismatches[0] });
        }
    }
    return { checked, disagreements };
}

function analyze(reportPath, root, outPath) {
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    const sites = classify(report, root);
    const text = render(report, sites);
    if (outPath) {
        fs.writeFileSync(outPath, text);
    }
    return { report, sites, text, getterCheck: checkGetter(sites), optionC: checkOptionC(sites) };
}

module.exports = { analyze, classify, checkGetter, checkOptionC };

if (require.main === module) {
    const root = process.cwd();
    const reportPath = process.argv[2] || path.join(root, 'build', 'lki-audit', 'report.json');
    const { text } = analyze(reportPath, root, null);
    console.log(text);
}
