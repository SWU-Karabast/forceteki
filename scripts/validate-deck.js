#!/usr/bin/env node
/**
 * Deck Validation Script
 *
 * Validates a decklist JSON file using the DeckValidator.
 * Requires 'npm run build-dev' to be run first.
 *
 * Usage:
 *   node scripts/validate-deck.js <path-to-decklist.json> [options]
 *
 * Options:
 *   --format <premier|open|next-set>  Game format (default: premier)
 *   --allow-30-cards                  Allow 30-card decks (only valid for Open format)
 *   --ignore-unimplemented            Don't report unimplemented cards in the deck
 *
 * Example:
 *   node scripts/validate-deck.js ./my-deck.json --format premier
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
const { SwuGameFormat } = require(path.join(serverDir, 'game/core/Constants.js'));

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        console.log(`
Deck Validation Script

Usage:
  node scripts/validate-deck.js <path-to-decklist.json> [options]

Options:
  --format <premier|open|next-set>  Game format (default: premier)
  --allow-30-cards                  Allow 30-card decks (only valid for Open format)
  --ignore-unimplemented            Don't report unimplemented cards in the deck
  --help, -h                        Show this help message

Example:
  node scripts/validate-deck.js ./my-deck.json --format premier
`);
        process.exit(0);
    }

    let deckPath = '';
    let format = SwuGameFormat.Premier;
    let allow30Cards = false;
    let ignoreUnimplemented = false;

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === '--format') {
            const formatArg = args[++i]?.toLowerCase();
            switch (formatArg) {
                case 'premier':
                    format = SwuGameFormat.Premier;
                    break;
                case 'open':
                    format = SwuGameFormat.Open;
                    break;
                case 'next-set':
                    format = SwuGameFormat.NextSetPreview;
                    break;
                default:
                    console.error(`Invalid format: ${formatArg}. Must be one of: premier, open, next-set`);
                    process.exit(1);
            }
        } else if (arg === '--allow-30-cards') {
            allow30Cards = true;
        } else if (arg === '--ignore-unimplemented') {
            ignoreUnimplemented = true;
        } else if (!arg.startsWith('--')) {
            deckPath = arg;
        }
    }

    if (!deckPath) {
        console.error('Error: No decklist file path provided.');
        process.exit(1);
    }

    // Validate allow30Cards is only used with Open format
    if (allow30Cards && format !== SwuGameFormat.Open) {
        console.error('Error: --allow-30-cards can only be used with --format open');
        process.exit(1);
    }

    return { deckPath, format, allow30Cards, ignoreUnimplemented };
}

function formatGameFormat(format) {
    switch (format) {
        case SwuGameFormat.Premier:
            return 'Premier';
        case SwuGameFormat.Open:
            return 'Open';
        case SwuGameFormat.NextSetPreview:
            return 'Next Set Preview';
        default:
            return String(format);
    }
}

async function main() {
    const { deckPath, format, allow30Cards, ignoreUnimplemented } = parseArgs();

    // Resolve deck path
    const resolvedDeckPath = path.isAbsolute(deckPath)
        ? deckPath
        : path.resolve(process.cwd(), deckPath);

    // Check if file exists
    if (!fs.existsSync(resolvedDeckPath)) {
        console.error(`Error: Decklist file not found: ${resolvedDeckPath}`);
        process.exit(1);
    }

    // Read and parse decklist
    let decklist;
    try {
        const deckContent = fs.readFileSync(resolvedDeckPath, 'utf8');
        decklist = JSON.parse(deckContent);
    } catch (error) {
        console.error(`Error: Failed to parse decklist JSON: ${error.message}`);
        process.exit(1);
    }

    console.log(`\nValidating deck: ${decklist.metadata?.name || 'Unnamed Deck'}`);
    console.log(`Author: ${decklist.metadata?.author || 'Unknown'}`);
    console.log(`Format: ${formatGameFormat(format)}`);
    if (allow30Cards) {
        console.log('30-card mode: enabled');
    }
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
        allow30CardsInMainBoard: allow30Cards
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
