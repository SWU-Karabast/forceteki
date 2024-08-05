import { lstatSync, readdirSync } from 'fs';
import { join, sep } from 'path';

function allJsFiles(path: string): string[] {
    const files = [];

    for (const file of readdirSync(path)) {
        if (file.startsWith('_')) {
            continue;
        }

        const filepath = join(path, file);
        if (lstatSync(filepath).isDirectory()) {
            files.push(...allJsFiles(filepath));
        } else if (file.endsWith('.js') && !path.endsWith(`${sep}cardImplementations`)) {
            files.push(filepath);
        }
    }
    return files;
}

const cardsMap = new Map<string, unknown>();
for (const filepath of allJsFiles(__dirname)) {
    const fileImported = require(filepath);
    const card = 'default' in fileImported ? fileImported.default : fileImported;
    if (!card.id) {
        throw Error('Importing card class without id!');
    }
    if (cardsMap.has(card.id)) {
        throw Error(`Importing card class with repeated id!: ${card}`);
    }
    cardsMap.set(card.id, card);
}

export const cards = cardsMap;
