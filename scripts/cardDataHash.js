const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

const HASH_INPUT_FILES = [
    'card-data-version.txt',
    'scripts/fetchdata.js',
    'scripts/mockdata.js',
];

function computeCardDataHash() {
    const hash = crypto.createHash('sha256');
    for (const file of HASH_INPUT_FILES) {
        hash.update(fs.readFileSync(path.join(projectRoot, file), 'utf8'));
    }
    return hash.digest('hex');
}

module.exports = { computeCardDataHash };
