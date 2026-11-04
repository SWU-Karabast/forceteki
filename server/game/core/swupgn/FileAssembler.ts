import { execFileSync } from 'child_process';
import type { CardId, CardLine, DeckLine, Header, Seat, SwuPgnFile, SwuRecord } from '@swupgn/format';
import { VERSION } from '@swupgn/format';
import type { IInternalCardEntry } from '../../../utils/deck/DeckInterfaces';
import type { Card } from '../card/Card';
import { GameEndReason } from '../Constants';
import type { Game } from '../Game';
import type { Player } from '../Player';
import { cardIdOf } from './SwuPgnCardIds';
import type { SwuPgnWriter } from './SwuPgnWriter';
import { anonymizedGameId, anonymizePlayerLabel, saltedPlayerId } from './swuPgnIdentity';

/** Bumped when the writer's output changes without a change of format (SPEC §5.2: diagnostic only, [W-09]). */
const writerRevision = 1;

const seats: readonly Seat[] = [1, 2];

/** `g.result` to the `Result` tag ([W-11]); a board with no result is an `Incomplete` game. */
const resultTags: Readonly<Record<string, string>> = { p1: 'P1', p2: 'P2', draw: 'Draw' };

// ---- Engine provenance ([W-12], [W-13]) --------------------------------------------------------

let cachedEngineVersion: string | undefined;

/**
 * Short git SHA of the working tree, with `-dirty` when the tree has uncommitted changes, or undefined when git or the
 * repo is not there (a deployed image has no `.git`). A bare HEAD SHA names the last commit, not the code that ran,
 * hence the suffix ([W-12]).
 */
function gitSha(): string | undefined {
    const git = (args: string[]): string | undefined => {
        try {
            return execFileSync('git', args, {
                cwd: __dirname, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 2000,
            }).trim();
        } catch {
            return undefined;
        }
    };
    const sha = git(['rev-parse', '--short', 'HEAD']);
    if (!sha) {
        return undefined;
    }
    // `--quiet` exits non-zero (so `undefined`) exactly when the tree differs from HEAD
    const clean = git(['diff', '--quiet', 'HEAD']) !== undefined;
    return clean ? sha : `${sha}-dirty`;
}

/**
 * The `Engine` tag: `forceteki@<build>`, naming one build. In order: the deploy-time `FORCETEKI_VERSION` (CI sets it
 * from the commit it built), the git SHA of the tree, then the package version; `forceteki@unknown` when none is known.
 * Computed once per process, because `execFileSync` blocks the event loop that every game on this node shares.
 */
export function engineVersion(): string {
    if (cachedEngineVersion == null) {
        const version = process.env.FORCETEKI_VERSION || gitSha() || process.env.npm_package_version;
        cachedEngineVersion = version ? `forceteki@${version}` : 'forceteki@unknown';
    }
    return cachedEngineVersion;
}

/** Resolve the engine version at server startup, so the `git` subprocess never runs on a game's path. */
export function warmEngineVersion(): void {
    engineVersion();
}

// ---- Header ------------------------------------------------------------------------------------

/** How the game ended, in words (the `Reason` tag: an open vocabulary, shown and never branched on). */
function gameEndReasonString(reason: GameEndReason | undefined): string {
    switch (reason) {
        case GameEndReason.Concede:
            return 'Concession';
        case GameEndReason.PlayerLeft:
            return 'Disconnection';
        case GameEndReason.GameRules:
            return 'Base destroyed';
        case GameEndReason.Timeout:
            return 'Timeout';
        default:
            return 'Unknown';
    }
}

/**
 * The `CardPool` from each card data source's set-code index, computed once per source: the server holds one for the
 * life of the process, and the index has thousands of entries.
 */
const cardPoolBySource = new WeakMap<object, string>();

/** Which sets the card pool holds, from the card data's set-code index; failing that, the sets of the cards in the game. */
function cardPool(game: Game): string {
    const source = game.cardDataGetter;
    const known = source ? cardPoolBySource.get(source) : undefined;
    if (known !== undefined) {
        return known;
    }
    const sets = new Set<string>();
    const add = (set: string) => {
        const code = set.toUpperCase();
        if ((/^[A-Z0-9]+$/).test(code)) {
            sets.add(code);
        }
    };
    for (const setCode of source?.setCodeMap?.keys() ?? []) {
        add(setCode.split('_')[0]);
    }
    if (sets.size > 0) {
        const pool = [...sets].sort()
            .join(',');
        if (source) {
            cardPoolBySource.set(source, pool);
        }
        return pool;
    }
    // no index: the game's own cards, which differ per game, so not cached
    for (const card of game.allCards) {
        if (!card.isToken()) {
            add(card.setId.set);
        }
    }
    return [...sets].sort()
        .join(',');
}

function leaderIds(player: Player): CardId[] {
    return player.getAllDeckLeaders().map((leader) => cardIdOf(leader));
}

function playerOf(game: Game, seat: Seat): Player {
    const player = game.getPlayers()[seat - 1];
    if (!player) {
        throw new Error(`SWU-PGN: the game has no player in seat ${seat}`);
    }
    return player;
}

function buildHeader(game: Game, writer: SwuPgnWriter): Header {
    const result = writer.currentBoard().entities.g?.a.result;
    const resultTag = typeof result === 'string' ? resultTags[result] : undefined;

    const header: Header = {
        Game: VERSION,
        Visibility: 'full',
        Steps: 'decision',
        GameId: anonymizedGameId(game.id),
        Date: (game.startedAt ?? game.createdAt).toISOString(),
        CardPool: cardPool(game),
        Engine: engineVersion()
    };
    for (const seat of seats) {
        header[`P${seat}Id`] = saltedPlayerId(playerOf(game, seat).id, game.id);
    }
    for (const seat of seats) {
        header[`P${seat}`] = anonymizePlayerLabel(seat);
    }
    for (const seat of seats) {
        header[`P${seat}Leader`] = leaderIds(playerOf(game, seat)).join(',');
        header[`P${seat}Base`] = cardIdOf(playerOf(game, seat).base);
    }
    header.Result = resultTag ?? 'Incomplete';
    // the reason the writer captured at the first game end: a later `endGame` call changes `Game.gameEndReason`, not the result
    header.Reason = resultTag ? gameEndReasonString(writer.gameEndReason ?? undefined) : 'Not finished';
    header.Rounds = String(game.roundNumber);
    if (resultTag && game.finishedAt) {
        header.EndDate = game.finishedAt.toISOString();
    }
    if (writer.undos > 0) {
        header.Undos = String(writer.undos);
    }
    if (writer.errors > 0) {
        header.WriterErrors = String(writer.errors);
    }
    header.WriterRevision = String(writerRevision);
    return header;
}

// ---- DECKS ([W-47]..[W-49]) ----------------------------------------------------------------------

/**
 * A decklist entry's id (`SOR_095`) as a card id (`SOR#095`). A suffix that is not a number is kept raw rather than
 * written as `SOR#NaN`.
 */
function deckEntryId(setCode: string): CardId {
    const parts = setCode.split('_');
    const num = Number(parts[1]);
    return parts.length === 2 && Number.isInteger(num) ? `${parts[0].toUpperCase()}#${String(num).padStart(3, '0')}` : setCode;
}

/** `deckNames` collects the display names of the decklist entries, which may never have been loaded into the game (a sideboard card). */
function buildDecks(game: Game, deckNames: Map<CardId, string>): DeckLine[] {
    return seats.map((seat) => {
        const player = playerOf(game, seat);
        const toEntries = (entries: IInternalCardEntry[]): [CardId, number][] => entries
            .filter((entry) => entry.count > 0)
            .map((entry) => {
                const id = deckEntryId(entry.id);
                const mapped = game.cardDataGetter?.cardMap?.get(entry.internalName);
                if (mapped?.title && !deckNames.has(id)) {
                    deckNames.set(id, displayName(mapped.title, mapped.subtitle));
                }
                return [id, entry.count];
            });

        const line: DeckLine = { p: seat, leaders: leaderIds(player), base: cardIdOf(player.base), complete: true, main: [] };
        const decklist = player.lobbyDeck?.getDecklist();
        if (decklist) {
            line.main = toEntries(decklist.deck);
            const sideboard = toEntries(decklist.sideboard ?? []);
            if (sideboard.length > 0) {
                line.sideboard = sideboard;
            }
        } else {
            // no lobby deck (a game built without one): count the seat's printed non-leader, non-base cards
            const counts = new Map<CardId, number>();
            for (const card of player.allCards) {
                if (!card.isLeader() && !card.isBase() && !card.isToken()) {
                    const id = cardIdOf(card);
                    counts.set(id, (counts.get(id) ?? 0) + 1);
                }
            }
            line.main = [...counts.entries()];
        }
        return line;
    });
}

// ---- CARDS ([W-50], [W-51]) ----------------------------------------------------------------------

function displayName(title: string, subtitle: string | null | undefined): string {
    return (subtitle ? `${title}, ${subtitle}` : title).normalize('NFC');
}

/** A card's `CARDS` line: its printed front, whatever side is up or whatever it is a copy of, and its other side's name. */
function cardLineOf(id: CardId, card: Card): CardLine {
    const name = displayName(card.printedTitle, card.printedSubtitle);
    const line: CardLine = { id, name };
    if (card.backSideTitle) {
        const backSideName = displayName(card.backSideTitle, card.backSideSubtitle);
        if (backSideName !== name) {
            line.backSideName = backSideName;
        }
    }
    return line;
}

/** Every card id the file mentions: the header's leaders and bases, every DECKS entry, every `card` and `copyOf` in RECORDS. */
function mentionedCardIds(header: Header, decks: readonly DeckLine[], records: readonly SwuRecord[]): Set<CardId> {
    const ids = new Set<CardId>();
    for (const seat of seats) {
        for (const id of header[`P${seat}Leader`].split(',')) {
            ids.add(id);
        }
        ids.add(header[`P${seat}Base`]);
    }
    for (const deck of decks) {
        deck.leaders.forEach((id) => ids.add(id));
        ids.add(deck.base);
        deck.main.forEach(([id]) => ids.add(id));
        (deck.sideboard ?? []).forEach(([id]) => ids.add(id));
    }
    for (const record of records) {
        if ((record.t === 'create' || record.t === 'reveal') && record.card !== undefined) {
            ids.add(record.card);
        }
        if ((record.t === 'create' || record.t === 'set') && typeof record.a?.copyOf === 'string') {
            ids.add(record.a.copyOf);
        }
    }
    return ids;
}

function buildCards(game: Game, mentioned: ReadonlySet<CardId>, deckNames: ReadonlyMap<CardId, string>): CardLine[] {
    const lines = new Map<CardId, CardLine>();
    for (const card of game.allCards) {
        const id = cardIdOf(card);
        if (mentioned.has(id) && !lines.has(id)) {
            lines.set(id, cardLineOf(id, card));
        }
    }
    for (const id of mentioned) {
        if (!lines.has(id)) {
            // a decklist card never loaded into the game gets its name from the card data; an id with none is shown as itself ([P-18])
            lines.set(id, { id, name: deckNames.get(id) ?? id });
        }
    }
    return [...lines.values()].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

/** The writer's `full` file: header, DECKS, CARDS and the records written so far. */
export function buildFullFile(game: Game, writer: SwuPgnWriter): SwuPgnFile {
    const records = [...writer.records];
    const header = buildHeader(game, writer);
    const deckNames = new Map<CardId, string>();
    const decks = buildDecks(game, deckNames);
    const cards = buildCards(game, mentionedCardIds(header, decks, records), deckNames);
    return { header, decks, cards, records, annotations: [], unknownSections: [] };
}
