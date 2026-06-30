#!/usr/bin/env node
/**
 * Deck Validation Script
 *
 * Validates a decklist JSON file using the DeckValidator.
 * Requires 'npm run build-dev' to be run first.
 *
 * Usage:
 *   node scripts/validate-deck.js <path-to-decklist.json> [options]
 *   node scripts/validate-deck.js --clipboard [options]
 *
 * Options:
 *   --clipboard                                  Read deck JSON from clipboard (macOS only)
 *   --format <premier|open|eternal|limited>      Game format (default: premier)
 *   --card-pool <current|next-set|unlimited>     Card pool (default: current)
 *   --ignore-unimplemented                       Don't report unimplemented cards in the deck
 *
 * Example:
 *   node scripts/validate-deck.js ./my-deck.json --format premier
 *   node scripts/validate-deck.js --clipboard --format open --card-pool unlimited
 *
 * Decklist JSON format (ISwuDbFormatDecklist):
 * {
 *   "metadata": { "name": "Deck Name", "author": "Author" },
 *   "leader": { "id": "sor_010" },
 *   "base": { "id": "sor_026" },
 *   "deck": [
 *     { "id": "sor_030", "count": 3 },
 *     ...
 *   ],
 *   "sideboard": [
 *     { "id": "sor_040", "count": 2 },
 *     ...
 *   ]
 * }
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import from build directory
const buildDir = path.resolve(__dirname, '../build');
const serverDir = path.join(buildDir, 'server');

// Check if build directory exists
if (!fs.existsSync(serverDir)) {
    console.error('Error: Build directory not found.');
    console.error('Please run \'npm run build-dev\' first.');
    process.exit(1);
}

const { UnitTestCardDataGetter } = require(path.join(buildDir, 'helpers/GameStateBuilder.js').replace('GameStateBuilder.js', '../server/utils/cardData/UnitTestCardDataGetter.js'));
const { DeckValidator } = require(path.join(serverDir, 'utils/deck/DeckValidator.js'));
const { SwuGameFormat, CardPool } = require(path.join(serverDir, 'game/core/Constants.js'));

// Card pools that are not valid for a given format. Premier and Eternal are rotating/
// constructed formats and don't support the Unlimited pool; Open and Limited accept any pool.
const UNSUPPORTED_FORMAT_CARD_POOLS = {
    [SwuGameFormat.Premier]: new Set([CardPool.Unlimited]),
    [SwuGameFormat.Eternal]: new Set([CardPool.Unlimited]),
};

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        console.log(`
Deck Validation Script

Usage:
  node scripts/validate-deck.js <path-to-decklist.json> [options]
  node scripts/validate-deck.js --clipboard [options]

Options:
  --clipboard                                  Read deck JSON from clipboard (macOS only)
  --format <premier|open|eternal|limited>      Game format (default: premier)
  --card-pool <current|next-set|unlimited>     Card pool (default: current)
  --ignore-unimplemented                       Don't report unimplemented cards in the deck
  --help, -h                                   Show this help message

Examples:
  node scripts/validate-deck.js ./my-deck.json --format premier
  node scripts/validate-deck.js --clipboard --format open --card-pool unlimited
`);
        process.exit(0);
    }

    let deckPath = '';
    let format = SwuGameFormat.Premier;
    let cardPool = CardPool.Current;
    let ignoreUnimplemented = false;
    let useClipboard = false;

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === '--clipboard') {
            useClipboard = true;
        } else if (arg === '--format') {
            const formatArg = args[++i]?.toLowerCase();
            switch (formatArg) {
                case 'premier':
                    format = SwuGameFormat.Premier;
                    break;
                case 'open':
                    format = SwuGameFormat.Open;
                    break;
                case 'eternal':
                    format = SwuGameFormat.Eternal;
                    break;
                case 'limited':
                    format = SwuGameFormat.Limited;
                    break;
                default:
                    console.error(`Invalid format: ${formatArg}. Must be one of: premier, open, eternal, limited`);
                    process.exit(1);
            }
        } else if (arg === '--card-pool') {
            const cardPoolArg = args[++i]?.toLowerCase();
            switch (cardPoolArg) {
                case 'current':
                    cardPool = CardPool.Current;
                    break;
                case 'next-set':
                    cardPool = CardPool.NextSet;
                    break;
                case 'unlimited':
                    cardPool = CardPool.Unlimited;
                    break;
                default:
                    console.error(`Invalid card pool: ${cardPoolArg}. Must be one of: current, next-set, unlimited`);
                    process.exit(1);
            }
        } else if (arg === '--ignore-unimplemented') {
            ignoreUnimplemented = true;
        } else if (!arg.startsWith('--')) {
            deckPath = arg;
        }
    }

    if (!deckPath && !useClipboard) {
        console.error('Error: No decklist file path provided. Use --clipboard to read from clipboard.');
        process.exit(1);
    }

    if (deckPath && useClipboard) {
        console.error('Error: Cannot use both a file path and --clipboard.');
        process.exit(1);
    }

    // Validate the format + card pool combination
    if (UNSUPPORTED_FORMAT_CARD_POOLS[format]?.has(cardPool)) {
        console.error(`Error: Card pool '${formatCardPool(cardPool)}' is not supported for format '${formatGameFormat(format)}'.`);
        process.exit(1);
    }

    return { deckPath, format, cardPool, ignoreUnimplemented, useClipboard };
}

function formatGameFormat(format) {
    switch (format) {
        case SwuGameFormat.Premier:
            return 'Premier';
        case SwuGameFormat.Open:
            return 'Open';
        case SwuGameFormat.Eternal:
            return 'Eternal';
        case SwuGameFormat.Limited:
            return 'Limited';
        default:
            return String(format);
    }
}

function formatCardPool(cardPool) {
    switch (cardPool) {
        case CardPool.Current:
            return 'Current';
        case CardPool.NextSet:
            return 'Next Set';
        case CardPool.Unlimited:
            return 'Unlimited';
        default:
            return String(cardPool);
    }
}

function readFromClipboard() {
    if (process.platform !== 'darwin') {
        console.error('Error: --clipboard is currently only supported on macOS.');
        console.error('On other platforms, please use a file path or pipe JSON via stdin.');
        process.exit(1);
    }

    try {
        const clipboardContent = execSync('pbpaste', { encoding: 'utf8' });
        if (!clipboardContent.trim()) {
            console.error('Error: Clipboard is empty.');
            process.exit(1);
        }
        return clipboardContent;
    } catch (error) {
        console.error(`Error: Failed to read from clipboard: ${error.message}`);
        process.exit(1);
    }
}

async function main() {
    const { deckPath, format, cardPool, ignoreUnimplemented, useClipboard } = parseArgs();

    let deckContent;

    if (useClipboard) {
        // Read from clipboard
        deckContent = readFromClipboard();
    } else {
        // Resolve deck path
        const resolvedDeckPath = path.isAbsolute(deckPath)
            ? deckPath
            : path.resolve(process.cwd(), deckPath);

        // Check if file exists
        if (!fs.existsSync(resolvedDeckPath)) {
            console.error(`Error: Decklist file not found: ${resolvedDeckPath}`);
            process.exit(1);
        }

        // Read file content
        deckContent = fs.readFileSync(resolvedDeckPath, 'utf8');
    }

    // Parse decklist JSON
    let decklist;
    try {
        decklist = JSON.parse(deckContent);
    } catch (error) {
        console.error(`Error: Failed to parse decklist JSON: ${error.message}`);
        process.exit(1);
    }

    console.log(`\nValidating deck: ${decklist.metadata?.name || 'Unnamed Deck'}`);
    console.log(`Author: ${decklist.metadata?.author || 'Unknown'}`);
    console.log(`Format: ${formatGameFormat(format)}`);
    console.log(`Card pool: ${formatCardPool(cardPool)}`);
    console.log('');

    // Initialize card data getter - use the build/test/json directory
    const cardDataDirectory = path.resolve(__dirname, '../build/test/json');
    if (!fs.existsSync(cardDataDirectory)) {
        console.error(`Error: Card data directory not found at ${cardDataDirectory}`);
        console.error('Please run \'npm run get-cards\' and \'npm run build-dev\' first.');
        process.exit(1);
    }

    let cardDataGetter;
    try {
        cardDataGetter = new UnitTestCardDataGetter(cardDataDirectory);
    } catch (error) {
        console.error(`Error: Failed to initialize card data: ${error.message}`);
        console.error('Please run \'npm run get-cards\' and \'npm run build-dev\' to update card data.');
        process.exit(1);
    }

    // Create deck validator
    const deckValidator = await DeckValidator.createAsync(cardDataGetter);

    // Validate the deck
    const validationProperties = {
        format,
        cardPool
    };

    const validationResults = deckValidator.validateSwuDbDeck(decklist, validationProperties);

    // Check for unimplemented cards (unless --ignore-unimplemented is set)
    if (!ignoreUnimplemented) {
        const unimplementedCards = deckValidator.getUnimplementedCardsInDeck(decklist);
        if (unimplementedCards.length > 0) {
            console.log('⚠️  Unimplemented cards in deck:');
            for (const card of unimplementedCards) {
                console.log(`   - ${card.name} (${card.id})`);
            }
            console.log('');
        }
    }

    // Output results
    if (Object.keys(validationResults).length === 0) {
        console.log('✅ Deck is valid!');
        process.exit(0);
    } else {
        console.log('❌ Deck validation failed:\n');

        for (const [reason, details] of Object.entries(validationResults)) {
            console.log(`  ${reason}:`);

            if (typeof details === 'boolean') {
                console.log('    true');
            } else if (Array.isArray(details)) {
                for (const item of details) {
                    if ('name' in item && 'id' in item) {
                        console.log(`    - ${item.name} (${item.id})`);
                    } else if ('card' in item) {
                        let msg = `    - ${item.card.name} (${item.card.id})`;
                        if (item.location) {
                            msg += ` [location: ${item.location}]`;
                        }
                        if (item.maxCopies !== undefined) {
                            msg += ` [max: ${item.maxCopies}, actual: ${item.actualCopies}]`;
                        }
                        console.log(msg);
                    } else {
                        console.log(`    - ${JSON.stringify(item)}`);
                    }
                }
            } else if (typeof details === 'object') {
                for (const [key, value] of Object.entries(details)) {
                    console.log(`    ${key}: ${value}`);
                }
            }
            console.log('');
        }

        process.exit(1);
    }
}

main().catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
});
