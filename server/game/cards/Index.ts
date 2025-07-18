import { lstatSync, readdirSync } from 'fs';
import { join, sep } from 'path';

function allJsFiles(path: string): string[] {
    const files = [];

    for (const file of readdirSync(path)) {
        if (file.startsWith('_')) {
            continue;
        }

        const filepath = join(path, file);
        // Directories named 'common' hold abstract classes and common implementations
        if (lstatSync(filepath).isDirectory() && !filepath.endsWith(`${sep}common`)) {
            files.push(...allJsFiles(filepath));
        } else if (file.endsWith('.js') && !path.endsWith(`${sep}cards`)) {
            files.push(filepath);
        }
    }
    return files;
}

// card.name
const cardsMap = new Map<string, any>();
const overrideNotImplementedCardsMap = new Map<string, any>();
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
        throw Error(`Importing card class with repeated id!: ${cardId.id}`);
    }
    if (cardClassNames.has(card.name)) {
        throw Error(`Import card class with duplicate class name: ${card.name}`);
    }

    cardsMap.set(cardId.id, card);
    cardClassNames.add(card.name);

    if (card.prototype.overrideNotImplemented) {
        overrideNotImplementedCardsMap.set(cardId.id, card);
    }
}

export const cards = cardsMap;
export const overrideNotImplementedCards = overrideNotImplementedCardsMap;
