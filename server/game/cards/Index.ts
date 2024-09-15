import { lstatSync, readdirSync } from 'fs';
import { join, sep } from 'path';

// TODO: rename cards/ to cards/
function allJsFiles(path: string): string[] {
    const files = [];

    for (const file of readdirSync(path)) {
        if (file.startsWith('_')) {
            continue;
        }

        const filepath = join(path, file);
        if (lstatSync(filepath).isDirectory()) {
            files.push(...allJsFiles(filepath));
        } else if (file.endsWith('.js') && !path.endsWith(`${sep}cards`)) {
            files.push(filepath);
        }
    }
    return files;
}

// card.name
const cardsMap = new Map<string, any>();
const cardClassNames = new Set<string>();
for (const filepath of allJsFiles(__dirname)) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fileImported = require(filepath);

    const card = 'default' in fileImported ? fileImported.default : fileImported;

    const cardId = card.prototype.getImplementationId();

    if (!cardId.id) {
        throw Error('Importing card class without id!');
    }
    if (cardsMap.has(cardId.id)) {
        throw Error(`Importing card class with repeated id!: ${card.name}`);
    }
    if (cardClassNames.has(card.name)) {
        throw Error(`Import card class with duplicate class name: ${card.name}`);
    }

    if (!card.implemented) {
        console.warn(`Warning: Loading partially implemented card '${cardId.internalName}'`);
    }

    cardsMap.set(cardId.id, card);
    cardClassNames.add(card.name);
}

export const cards = cardsMap;
