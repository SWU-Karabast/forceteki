/**
 * LKI behavior-delta audit.
 *
 * Runs the game specs with audit-helper.js installed, then classifies every read, from card code, of
 * a card that has left play during the current action (or whose identity has been tombstoned). The
 * method and the results so far are in long-term-project-docs/lki-migration-register.md §G.2.
 *
 *   npm run lki-audit                                  the whole game suite
 *   npm run lki-audit -- build/test/<path>.spec.js     selected specs
 *   npm run lki-audit -- --self-check                  checks the audit still detects three known cases
 *
 * Build first (`npm run build-test`). Output goes to build/lki-audit/: report.json, analysis.md and
 * jasmine.log. The audit only observes, so any spec failure means the run cannot be trusted.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { analyze } = require('./analyze');

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'build', 'lki-audit');
const REPORT = path.join(OUT_DIR, 'report.json');
const ANALYSIS = path.join(OUT_DIR, 'analysis.md');
const LOG = path.join(OUT_DIR, 'jasmine.log');

const SELF_CHECK_SPECS = ['SuperlaserTechnician', 'Bothan5NewRepublicPrisonShip', 'SparkOfHope'];
const SELF_CHECK_EXPECTATIONS = [
    { card: 'SuperlaserTechnician', property: 'zoneName', state: 'recorded', differs: true, why: 'its own When Defeated asks whether it is in the discard pile' },
    { card: 'Bothan5NewRepublicPrisonShip', property: 'zone', state: 'recorded', differs: true, why: 'its trigger asks whether the defeated unit is in the discard pile' },
    { card: 'SparkOfHope', property: 'isUnit', state: 'tombstoned', differs: false, why: 'it selects a unit defeated in an earlier action' }
];

function fail(message) {
    console.error(`[lki-audit] ${message}`);
    process.exit(1);
}

function listFiles(dir, predicate, found = []) {
    if (!fs.existsSync(dir)) {
        return found;
    }
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            listFiles(full, predicate, found);
        } else if (predicate(full)) {
            found.push(full);
        }
    }
    return found;
}

/**
 * build/ is never cleaned, so compiled cards and specs from another branch linger, and fast builds
 * never refresh the copy of the card data. Either one makes the results meaningless.
 */
function preflight() {
    if (!fs.existsSync(path.join(ROOT, 'build', 'server', 'game', 'cards', 'Index.js'))) {
        fail('No build found. Run `npm run build-test` first.');
    }

    const stale = ['server', 'test'].flatMap((top) => listFiles(path.join(ROOT, 'build', top), (file) => file.endsWith('.js')))
        .filter((file) => {
            const source = path.relative(path.join(ROOT, 'build'), file).replace(/\.js$/, '');
            return !fs.existsSync(path.join(ROOT, `${source}.ts`)) && !fs.existsSync(path.join(ROOT, `${source}.js`));
        });
    if (stale.length > 0) {
        const shown = stale.slice(0, 15).map((file) => `  ${path.relative(ROOT, file)}`)
            .join('\n');
        fail(`${stale.length} compiled files in build/ have no source, probably from another branch:\n${shown}\n` +
          'Delete them (and their .map files), or delete build/ and rebuild.');
    }

    for (const name of ['_cardMap.json', '_mockCardNames.json']) {
        const source = path.join(ROOT, 'test', 'json', name);
        const copy = path.join(ROOT, 'build', 'test', 'json', name);
        if (fs.existsSync(source) && (!fs.existsSync(copy) || !fs.readFileSync(source).equals(fs.readFileSync(copy)))) {
            fail(`build/test/json/${name} does not match test/json/${name}. Fast builds never refresh that copy: ` +
              'delete build/test/json and run `npx cpy ./test/json/ ./build/`, or run `npm run build-test`.');
        }
    }
}

function findSpecs(names) {
    const specs = listFiles(path.join(ROOT, 'build', 'test', 'server', 'cards'), (file) => names.includes(path.basename(file, '.spec.js')));
    if (specs.length !== names.length) {
        fail(`Expected to find specs for ${names.join(', ')}, found ${specs.length}.`);
    }
    return specs.map((file) => path.relative(ROOT, file).replace(/\\/g, '/'));
}

function runJasmine(specs) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.rmSync(REPORT, { force: true });
    const helper = path.join(__dirname, 'audit-helper.js').replace(/\\/g, '/');
    const args = [
        '--enable-source-maps', 'node_modules/jasmine/bin/jasmine', '--config=./jasmine-game.json', '--random=false',
        `--helper=${helper}`, ...specs
    ];
    const log = fs.openSync(LOG, 'w');
    const result = spawnSync(process.execPath, args, {
        cwd: ROOT,
        env: { ...process.env, NODE_ENV: 'test', LKI_AUDIT_OUT: REPORT },
        stdio: ['ignore', log, log]
    });
    fs.closeSync(log);

    const output = fs.readFileSync(LOG, 'utf8');
    const summary = (/(\d+) specs?, (\d+) failures?/).exec(output);
    console.log(`[lki-audit] ${summary ? summary[0] : 'jasmine produced no summary'} (log: ${path.relative(ROOT, LOG)})`);
    if (!fs.existsSync(REPORT)) {
        fail('No report was written. See the jasmine log.');
    }
    return { failures: summary ? Number(summary[2]) : NaN, status: result.status };
}

function selfCheck(sites, report, failures) {
    const checks = SELF_CHECK_EXPECTATIONS.map((expected) => {
        const found = sites.some((site) => site.file.endsWith(`/${expected.card}.ts`) && site.property === expected.property &&
          site.state === expected.state && (!expected.differs || site.differs > 0));
        return { ok: found, text: `${expected.card} .${expected.property} [${expected.state}] — ${expected.why}` };
    });
    checks.push({ ok: report.auditErrors === 0, text: `no audit errors (found ${report.auditErrors})` });
    checks.push({ ok: failures === 0, text: `no spec failures (found ${failures})` });
    for (const check of checks) {
        console.log(`[lki-audit] ${check.ok ? 'PASS' : 'FAIL'} ${check.text}`);
    }
    return checks.every((check) => check.ok);
}

function main() {
    const argv = process.argv.slice(2);
    const isSelfCheck = argv.includes('--self-check');
    const specs = isSelfCheck ? findSpecs(SELF_CHECK_SPECS) : argv.filter((arg) => !arg.startsWith('--'));

    preflight();
    const { failures } = runJasmine(specs);
    const { report, sites, text } = analyze(REPORT, ROOT, ANALYSIS);

    if (isSelfCheck) {
        process.exit(selfCheck(sites, report, failures) ? 0 : 1);
    }

    console.log(text.split('\n## A.')[0]);
    console.log(`\n[lki-audit] full classification: ${path.relative(ROOT, ANALYSIS)}`);
    if (failures !== 0) {
        fail('Specs failed, so this run cannot be trusted: the audit only observes. See the jasmine log.');
    }
}

main();
