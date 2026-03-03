import { lstatSync, readdirSync } from 'fs';
import { join, sep } from 'path';
import { registerStateClassMarker } from '../core/GameObjectUtils';

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

/**
 * Mirrors the wrapper pattern used in registerState() in GameObjectUtils.ts.
 * We dynamically import card classes, then return a named subclass wrapper that:
 * 1) preserves the original class name for diagnostics/lookup behavior,
 * 2) guarantees initialize() has run before the instance is used, and
 * 3) marks the runtime constructor with registerStateClassMarker so state-class checks
 *    operate on the constructed wrapper class (not only the original imported class).
 */
function buildAutoInitializingCardClass(targetCardClass: any): any {
    const wrappedClass: any = {
        [targetCardClass.name]: class extends targetCardClass {
            public constructor(...args: any[]) {
                super(...args);

                if (!this.initialized) {
                    this.initialize();
                }
            }
        }
    }[targetCardClass.name];

    Object.defineProperty(wrappedClass, registerStateClassMarker, {
        value: true,
        writable: false,
        enumerable: false,
        configurable: false
    });

    return wrappedClass;
}

// card.name
const cardsMap = new Map<string, any>();
const overrideNotImplementedCardsMap = new Map<string, any>();
const cardClassNames = new Set<string>();
for (const filepath of allJsFiles(__dirname)) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fileImported = require(filepath);

    const card = 'default' in fileImported ? fileImported.default : fileImported;

    if (!card.prototype) {
        throw Error(`Failed to import card implementation from ${filepath}`);
    }

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

    const wrappedCardClass = buildAutoInitializingCardClass(card);
    cardsMap.set(cardId.id, wrappedCardClass);
    cardClassNames.add(card.name);

    if (card.prototype.overrideNotImplemented) {
        overrideNotImplementedCardsMap.set(cardId.id, wrappedCardClass);
    }
}

export const cards = cardsMap;
export const overrideNotImplementedCards = overrideNotImplementedCardsMap;


