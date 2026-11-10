/* eslint no-console:0 */
// Reports whether the locally cached card data in test/json/ (written by `npm run get-cards`) is what the current
// checkout expects, without downloading anything. The expected value is the hash of card-data-version.txt,
// fetchdata.js and mockdata.js (see cardDataHash.js), the same value the build writes and the server and test
// harness check at startup, so a branch that changes any of those files needs a refresh.
//
// Exits 0 when the cache is current and 1 when `npm run get-cards` is needed.

const fs = require('fs');
const path = require('path');
const { computeCardDataHash } = require('./cardDataHash');

const projectRoot = path.join(__dirname, '..');
const cardDataDir = path.join(projectRoot, 'test', 'json');
const installedHashPath = path.join(cardDataDir, 'card-data-hash.txt');
const builtHashPath = path.join(projectRoot, 'build', 'server', 'card-data-hash.txt');

// files the card data loader cannot run without
const requiredEntries = ['_cardMap.json', '_setCodeMap.json', 'Card'];

function readTrimmedOrNull(filePath) {
    return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8').trim() : null;
}

function findProblems(expectedHash) {
    if (!fs.existsSync(cardDataDir)) {
        return [`${path.relative(projectRoot, cardDataDir)} does not exist`];
    }

    const problems = requiredEntries
        .filter((entry) => !fs.existsSync(path.join(cardDataDir, entry)))
        .map((entry) => `${entry} is missing from ${path.relative(projectRoot, cardDataDir)}`);

    const installedHash = readTrimmedOrNull(installedHashPath);
    if (installedHash === null) {
        problems.push(`${path.relative(projectRoot, installedHashPath)} is missing`);
    } else if (installedHash !== expectedHash) {
        problems.push(`installed card data hash ${installedHash} does not match the ${expectedHash} this checkout expects`);
    }

    return problems;
}

const expectedHash = computeCardDataHash();
const problems = findProblems(expectedHash);

if (problems.length > 0) {
    console.log('Card data needs a refresh: run `npm run get-cards`.');
    for (const problem of problems) {
        console.log(`  - ${problem}`);
    }
    process.exitCode = 1;
} else {
    console.log(`Card data is current (hash ${expectedHash}).`);
}

// The build stamps the expected hash into build/ too. Every build script rewrites it, so a stale one only matters
// when running jasmine directly against an old build.
const builtHash = readTrimmedOrNull(builtHashPath);
if (builtHash !== null && builtHash !== expectedHash) {
    console.log('Note: build/ was built for different card data; the next build (npm test, test-fast, build, dev) rewrites it.');
}
