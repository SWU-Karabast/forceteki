import { DoubleSidedLeaderCard } from '../card/DoubleSidedLeaderCard';
import type { Card } from '../card/Card';
import type { IBaseCard } from '../card/BaseCard';
import { InPlayCard } from '../card/baseClasses/InPlayCard';
import type { ICardWithExhaustProperty } from '../card/baseClasses/PlayableOrDeployableCard';
import { LeaderUnitCard } from '../card/LeaderUnitCard';
import type { Game } from '../Game';
import type { Player } from '../Player';
import { CaptureZone } from '../zone/CaptureZone';
import { serializeAbilityLimitsForCard } from './AbilityLimitSerializer';
import type { ISeatedPlayer } from './AbilityLimitSerializer';
import { scrubChatMessages } from './ChatScrubber';
import { buildPilotLeaderFacts, classifyOngoingEffects } from './EngineOnlyFacts';
import { SavedCardRefResolver } from './SavedCardRefResolver';
import { serializeStateWatchers } from './StateWatcherSerializer';
import { SAVED_MATCH_FORMAT_VERSION, SaveIntegrityError } from './SavedMatchInterfaces';
import type {
    IEngineOnlyFact,
    ISavedCardRef,
    ISaveOptions,
    ISavedArenaEntry,
    ISavedAttachedCard,
    ISavedBaseEntry,
    ISavedLeaderEntry,
    ISavedMatch,
    ISavedPlayer,
    ISavedResourceEntry,
    SavedArrayRefZone,
    SavedParentRefZone,
} from './SavedMatchInterfaces';

/**
 * `ownerSeat`/`controllerSeat` fields are non-optional (or, where `?`-marked, must never be emitted as
 * `undefined` when present) per the schema's own invariant (AC8). `card.owner`/`.controller` not being one
 * of the two seated players is not reachable in a normal two-player match, but an unguarded `Map.get` would
 * otherwise silently emit `undefined` into one of those fields rather than refusing an untrustworthy
 * document, unlike every other hard-fail path in this writer.
 */
function requireSeat(seatByPlayer: ReadonlyMap<Player, string>, player: Player): string {
    const seat = seatByPlayer.get(player);
    if (seat == null) {
        throw new SaveIntegrityError(`Player "${player.name}" is not one of the seated players being saved.`);
    }
    return seat;
}

/**
 * `parentSeat` is the seat whose arrays `parentZone`/`parentOrdinal` index into. It is passed explicitly
 * rather than read off the nested card, whose own controller can differ from its parent's -- see
 * `ISavedCardRef.parent` for the two live ways that happens.
 */
function buildAttachedCardEntries(
    cards: readonly Card[],
    seatByPlayer: ReadonlyMap<Player, string>,
    refResolver: SavedCardRefResolver,
    parentSeat: string,
    parentZone: SavedParentRefZone,
    parentOrdinal: number,
    list: 'upgrades' | 'capturedCards',
    exclude: ReadonlySet<Card>
): ISavedAttachedCard[] {
    const entries: ISavedAttachedCard[] = [];

    for (const card of cards) {
        if (exclude.has(card)) {
            continue;
        }

        const ownerSeat = requireSeat(seatByPlayer, card.owner);
        refResolver.indexNested(card, requireSeat(seatByPlayer, card.controller), parentSeat, parentZone, parentOrdinal, list);
        entries.push({ card: card.internalName, ownerSeat });
    }

    return entries;
}

function buildArenaEntry(
    card: Card,
    controllerSeat: string,
    ordinal: number,
    zone: SavedArrayRefZone,
    seatByPlayer: ReadonlyMap<Player, string>,
    seatedPlayers: readonly ISeatedPlayer[],
    refResolver: SavedCardRefResolver,
    pilotDeployedLeaders: ReadonlySet<Card>
): ISavedArenaEntry {
    refResolver.indexTopLevel(card, controllerSeat, zone, ordinal);

    const state = card.getCardState();
    const ownerSeat = requireSeat(seatByPlayer, card.owner);

    return {
        card: card.internalName,
        damage: state.damage ?? 0,
        exhausted: !!state.exhausted,
        ...(ownerSeat !== controllerSeat ? { ownerSeat } : {}),
        upgrades: buildAttachedCardEntries(state.upgrades ?? [], seatByPlayer, refResolver, controllerSeat, zone, ordinal, 'upgrades', pilotDeployedLeaders),
        capturedCards: buildAttachedCardEntries(state.capturedUnits ?? [], seatByPlayer, refResolver, controllerSeat, zone, ordinal, 'capturedCards', new Set()),
        limits: serializeAbilityLimitsForCard(card, seatedPlayers),
    };
}

function buildBaseEntry(
    base: IBaseCard,
    controllerSeat: string,
    seatByPlayer: ReadonlyMap<Player, string>,
    seatedPlayers: readonly ISeatedPlayer[],
    refResolver: SavedCardRefResolver
): ISavedBaseEntry {
    refResolver.indexTopLevel(base, controllerSeat, 'base', 0);

    const state = base.getCardState();

    return {
        card: base.internalName,
        damage: state.damage ?? 0,
        upgrades: buildAttachedCardEntries(base.upgrades, seatByPlayer, refResolver, controllerSeat, 'base', 0, 'upgrades', new Set()),
        capturedCards: buildAttachedCardEntries(base.capturedUnits, seatByPlayer, refResolver, controllerSeat, 'base', 0, 'capturedCards', new Set()),
        limits: serializeAbilityLimitsForCard(base, seatedPlayers),
    };
}

function buildLeaderEntry(
    leader: Card,
    controllerSeat: string,
    seatByPlayer: ReadonlyMap<Player, string>,
    seatedPlayers: readonly ISeatedPlayer[],
    refResolver: SavedCardRefResolver,
    isPilotDeployed: boolean
): ISavedLeaderEntry {
    refResolver.indexTopLevel(leader, controllerSeat, 'leader', 0);

    const limits = serializeAbilityLimitsForCard(leader, seatedPlayers);

    if (leader instanceof DoubleSidedLeaderCard) {
        // No WithDamage, not deployable as a unit: a fixed shape, per the schema's documented deviation.
        return {
            card: leader.internalName,
            deployed: false,
            exhausted: leader.exhausted,
            damage: 0,
            epicDeployUsed: false,
            onStartingSide: leader.onStartingSide,
            upgrades: [],
            capturedCards: [],
            limits,
        };
    }

    // leader instanceof LeaderUnitCard from here on.
    const leaderUnit = leader as LeaderUnitCard;

    if (isPilotDeployed) {
        // A pilot-deployed leader's own zone is its host's arena, where `exhausted`/`upgrades`/
        // `capturedUnits` are all disabled properties for a card in that attached position (reading any of
        // them asserts). It is represented as `deployed: false` with a fixed, empty shape: its `pilotLeader`
        // engineOnlyFacts entry is the only place the attachment itself is recorded.
        return {
            card: leaderUnit.internalName,
            deployed: false,
            exhausted: false,
            damage: 0,
            epicDeployUsed: leaderUnit.deployEpicActionLimit.isAtMax(leaderUnit.owner),
            upgrades: [],
            capturedCards: [],
            limits,
        };
    }

    const state = leaderUnit.getCardState();

    return {
        card: leaderUnit.internalName,
        deployed: !!state.deployed,
        exhausted: leaderUnit.exhausted,
        damage: state.damage ?? 0,
        epicDeployUsed: leaderUnit.deployEpicActionLimit.isAtMax(leaderUnit.owner),
        upgrades: buildAttachedCardEntries(state.upgrades ?? [], seatByPlayer, refResolver, controllerSeat, 'leader', 0, 'upgrades', new Set()),
        capturedCards: buildAttachedCardEntries(state.capturedUnits ?? [], seatByPlayer, refResolver, controllerSeat, 'leader', 0, 'capturedCards', new Set()),
        limits,
    };
}

function buildResourceEntry(
    card: Card,
    controllerSeat: string,
    ordinal: number,
    seatByPlayer: ReadonlyMap<Player, string>,
    refResolver: SavedCardRefResolver
): ISavedResourceEntry {
    refResolver.indexTopLevel(card, controllerSeat, 'resources', ordinal);

    const ownerSeat = requireSeat(seatByPlayer, card.owner);

    return {
        card: card.internalName,
        // Never getCardState() here: UnitProperties.getCardState() returns undefined for a card not
        // currently in play, which every resource-zone unit is; `exhausted` is enabled in that zone
        // regardless of card type.
        exhausted: (card as unknown as ICardWithExhaustProperty).exhausted,
        ...(ownerSeat !== controllerSeat ? { ownerSeat } : {}),
    };
}

/**
 * Gives the base zone's Force and Credit tokens coordinates, without emitting them as document members:
 * `hasTheForce` and `creditTokens` already carry their existence and count canonically, and a loader
 * rebuilds the objects from those. What they need is a *referent* coordinate, because a watcher entry can
 * name one: `CreateForceTokenSystem` and `CreateCreditTokenSystem` both fire `OnTokensCreated` and
 * `moveTo(ZoneName.Base)`, `TokensCreatedThisPhaseWatcher` records every generated token unfiltered, and
 * `TheClientPleaseLowerYourBlaster` / `JarJarBinksBombadGeneral` read that watcher. Without a coordinate
 * every such entry was dropped on an ordinary play path, costing the player an ability they were entitled
 * to after a load.
 *
 * `seat` is the base zone's owner's seat, which `BaseZone.setForceToken`/`addCreditToken` both assert is
 * also the token's controller.
 */
function indexBaseZoneTokens(player: Player, seat: string, refResolver: SavedCardRefResolver): void {
    const baseZone = player.baseZone;

    if (baseZone.forceToken != null) {
        refResolver.indexTopLevel(baseZone.forceToken, seat, 'forceToken', 0);
    }

    baseZone.credits.forEach((credit, ordinal) => refResolver.indexTopLevel(credit, seat, 'creditTokens', ordinal));
}

function indexSimpleZoneCards(
    cards: readonly Card[],
    controllerSeat: string,
    zone: SavedArrayRefZone,
    refResolver: SavedCardRefResolver
): string[] {
    return cards.map((card, ordinal) => {
        refResolver.indexTopLevel(card, controllerSeat, zone, ordinal);
        return card.internalName;
    });
}

/**
 * The cards the arena walk must skip because {@link buildLeaderEntry} emits them at the `leader` singleton
 * instead. Deliberately identity against the seated players' `deckLeader`s rather than `card.isLeaderUnit()`,
 * which is not a statement about the card's identity at all: `UnitProperties.isLeaderUnit` returns
 * `isLeaderAttachedToThis()`, so *any* ordinary unit currently piloted by a deployed leader answers `true`
 * to it. Filtering on that predicate silently dropped every such host unit from the document (and, with it,
 * its own upgrades, which are only reachable through its arena entry) -- the defect `assertCompleteness`
 * caught. Both leaders go in one set rather than one per seat because a leader whose control has changed
 * shows up in the *opponent's* arena while still being emitted at its owner's `leader` position, and
 * indexing it in both places would trip `SavedCardRefResolver`'s duplicate guard.
 */
function collectDeckLeaders(players: readonly Player[]): Set<Card> {
    return new Set<Card>(players.map((player) => player.deckLeader).filter((leader) => leader != null));
}

/** `deployed === true && isAttached()`, per `LeaderUnitCard.addPilotDeploy`. */
function findPilotDeployedLeaders(players: readonly Player[]): LeaderUnitCard[] {
    const leaders: LeaderUnitCard[] = [];
    for (const player of players) {
        const leader = player.deckLeader;
        if (leader instanceof LeaderUnitCard && leader.deployed && leader.isAttached()) {
            leaders.push(leader);
        }
    }
    return leaders;
}

/**
 * The card set the completeness assertion checks against: every card owned by either player that is
 * currently in a zone (the union of `decklist.allCards`, `.tokens`, and `.outsideTheGameCards`, filtered to
 * `card.zone != null`), minus Force and credit tokens. Those do get coordinates (see
 * {@link indexBaseZoneTokens}) but are still not *required* to appear: they are canonically represented by
 * `hasTheForce` and `creditTokens`, so a document that omits one is not incomplete, and the writer should
 * not refuse an entire save over a token in a transitional zone. The zone filter is mandatory: `Game.roundEnded` removes every non-Force token from
 * `outsideTheGame` each round without clearing the card lists, so from round 2 onward almost every game
 * carries zone-less tokens that must not be required to appear anywhere in the document.
 */
function collectExpectedCards(game: Game): Set<Card> {
    const expected = new Set<Card>();

    for (const player of game.getPlayers()) {
        const ids = [...player.decklist.allCards, ...player.decklist.tokens, ...player.decklist.outsideTheGameCards];
        for (const id of ids) {
            const card = game.getFromId(id);
            if (card && card.zone != null && !card.isForceToken() && !card.isCreditToken()) {
                expected.add(card);
            }
        }
    }

    return expected;
}

/**
 * The card whose saved entry would have to carry `card`, if `card` is nested under another card at all:
 * its captor when it sits in a `CaptureZone`, its parent when it is attached. `null` means `card` sits
 * directly in a zone the position walk enumerates in its own right, which is the distinction
 * {@link buildUnrepresentedCardFacts} turns on -- a miss there is a writer defect, not unrepresentable
 * state, and must stay loud.
 *
 * Both reads are upward and assertion-free, which the downward ones are not: `UnitProperties.upgrades` and
 * `.capturedUnits` both go through `assertPropertyEnabledForZone`, and an assertion here would route
 * through `Game.reportError` and give the read-only writer a side effect on the game it is describing.
 */
function getNestingContainer(card: Card): Card | null {
    if (card.zone instanceof CaptureZone) {
        return card.zone.captor as unknown as Card;
    }

    if (card instanceof InPlayCard && card.isAttached()) {
        return card.parentCard as unknown as Card;
    }

    return null;
}

/**
 * The reconciliation between the position walk and {@link collectExpectedCards}: one `unrepresentedCard`
 * manifest entry per on-board card the walk did not place, for the cards whose position `v1` structurally
 * cannot express. Two shapes reach this, and both are genuinely unrepresentable rather than missed:
 *
 * - **A container that no longer lists the card.** `UnitProperties.setCaptureZoneEnabled` mints a *new*
 *   `CaptureZone` each time capture is re-enabled, so bouncing a captor out of play and replaying it leaves
 *   the captive pointing at a zone the captor has since replaced. The captor's live `capturedUnits` no
 *   longer contains it, and no walk of the captor can produce it. This is the shape `measure-degradation`
 *   actually observes.
 * - **Nested more than one level deep.** `ISavedAttachedCard` is `{ card, ownerSeat }` with no child lists
 *   of its own, and `ISavedCardRef.parent` addresses a nested card only as a direct child of a *top-level*
 *   position. An upgrade on a captured unit, or a unit captured by a card that is itself attached, has no
 *   coordinate to be given -- so `buildAttachedCardEntries` does not recurse, and what it cannot reach is
 *   declared here instead. No board in the suite currently produces this, so it is covered structurally
 *   rather than by a repro spec.
 *
 * Per the owning plan's degrade-with-manifest rule, unrepresentable state is dropped and enumerated rather
 * than refused. The rule is deliberately narrow: it forgives only a card that hangs off another card, never
 * one sitting in a plain zone, so it cannot absorb a repeat of the `isLeaderUnit()` arena-filter defect
 * (whose victims had no container at all) into a quiet manifest line.
 */
function buildUnrepresentedCardFacts(
    expectedCards: ReadonlySet<Card>,
    refResolver: SavedCardRefResolver,
    resolveCardRef: (card: Card) => ISavedCardRef
): { facts: IEngineOnlyFact[]; declared: Set<Card> } {
    const facts: IEngineOnlyFact[] = [];
    const declared = new Set<Card>();

    for (const card of expectedCards) {
        if (refResolver.isIndexed(card)) {
            continue;
        }

        const container = getNestingContainer(card);
        if (container == null) {
            continue;
        }

        const relation = card.zone instanceof CaptureZone ? 'captured by' : 'attached to';

        declared.add(card);
        facts.push({
            category: 'unrepresentedCard',
            source: resolveCardRef(card),
            target: resolveCardRef(container),
            duration: null,
            description: `${card.internalName} is ${relation} ${container.internalName}, whose own saved position cannot carry it: v1 expresses a nested card only as a direct child of a top-level position. The card is not saved.`,
        });
    }

    return { facts, declared };
}

/**
 * Produces the lossless `v1` save-format document for `game`. Does not call, wrap, or model itself on
 * `Game.captureGameState`, which truncates the deck to five cards and drops all limits and effects. The
 * writer's public surface is read-only: it returns a document and leaves the game as it found it (the one
 * exception, the pristine-derivation helper inside `AbilityLimitSerializer`'s coordinate-drift guard,
 * undoes its own side effects before returning).
 */
export function save(game: Game, options: ISaveOptions = {}): ISavedMatch {
    const players = game.getPlayers();
    const seatedPlayers: ISeatedPlayer[] = players.map((player, index) => ({ seat: `p${index + 1}`, player }));
    const seatByPlayer = new Map<Player, string>(seatedPlayers.map(({ seat, player }) => [player, seat]));
    // Keyed by uuid rather than by object because a watcher entry stores a `GameObjectId`, which is a
    // branded `uuid`; resolving it this way keeps the writer off `Game.getFromId` entirely.
    const seatByUuid = new Map<string, string>(seatedPlayers.map(({ seat, player }) => [player.uuid, seat]));
    const getSeatForPlayer = (player: Player): string => requireSeat(seatByPlayer, player);

    // Phase 1: pre-pass.
    const pilotDeployedLeaders = findPilotDeployedLeaders(players);
    const pilotDeployedLeaderSet = new Set<Card>(pilotDeployedLeaders);
    const deckLeaders = collectDeckLeaders(players);

    // Phase 2: position walk.
    const refResolver = new SavedCardRefResolver();
    const savedPlayers: ISavedPlayer[] = seatedPlayers.map(({ seat, player }) => {
        const hand = indexSimpleZoneCards(player.hand, seat, 'hand', refResolver);
        const deck = indexSimpleZoneCards(player.deckZone.cards, seat, 'deck', refResolver);
        const discard = indexSimpleZoneCards(player.discard, seat, 'discard', refResolver);
        const outsideTheGame = indexSimpleZoneCards(player.outsideTheGameZone.cards, seat, 'outsideTheGame', refResolver);

        const resources = player.resources.map((card, ordinal) => buildResourceEntry(card, seat, ordinal, seatByPlayer, refResolver));

        const groundArenaCards = game.groundArena.getCards({ controller: player }).filter((card) => !deckLeaders.has(card) && !card.isAttached());
        const spaceArenaCards = game.spaceArena.getCards({ controller: player }).filter((card) => !deckLeaders.has(card) && !card.isAttached());

        const groundArena = groundArenaCards.map((card, ordinal) =>
            buildArenaEntry(card, seat, ordinal, 'groundArena', seatByPlayer, seatedPlayers, refResolver, pilotDeployedLeaderSet));
        const spaceArena = spaceArenaCards.map((card, ordinal) =>
            buildArenaEntry(card, seat, ordinal, 'spaceArena', seatByPlayer, seatedPlayers, refResolver, pilotDeployedLeaderSet));

        const base = buildBaseEntry(player.base, seat, seatByPlayer, seatedPlayers, refResolver);
        indexBaseZoneTokens(player, seat, refResolver);
        const leader = buildLeaderEntry(
            player.deckLeader, seat, seatByPlayer, seatedPlayers, refResolver, pilotDeployedLeaderSet.has(player.deckLeader)
        );

        return {
            seat,
            name: player.name,
            // Copied rather than aliased: the document is a self-contained snapshot, and a live reference
            // here would let a consumer mutating doc.players[n].decklist mutate the running game, and a
            // later engine change to the live object retroactively alter an already-produced document. The
            // copy also protects AC8's JSON round-trip equality from ever depending on
            // ISwuDbFormatDecklist never carrying an undefined optional member in production.
            decklist: JSON.parse(JSON.stringify(player.lobbyDeck.originalDeckList)),
            base,
            leader,
            hand,
            deck,
            discard,
            resources,
            groundArena,
            spaceArena,
            outsideTheGame,
            hasTheForce: player.hasTheForce,
            creditTokens: player.creditTokenCount,
        };
    });

    // Phase 3: detection and manifest.
    const resolveCardRef = (card: Card) => refResolver.resolve(card, getSeatForPlayer(card.controller));
    const watchers = serializeStateWatchers(game, refResolver, seatByUuid);
    const expectedCards = collectExpectedCards(game);
    const unrepresentedCards = buildUnrepresentedCardFacts(expectedCards, refResolver, resolveCardRef);
    const engineOnlyFacts: IEngineOnlyFact[] = [
        ...buildPilotLeaderFacts(pilotDeployedLeaders, resolveCardRef),
        ...classifyOngoingEffects(game, resolveCardRef, getSeatForPlayer, seatedPlayers),
        ...unrepresentedCards.facts,
        ...watchers.droppedFacts,
    ];

    const chat = scrubChatMessages(game.gameChat.messages);

    const timers: Record<string, { mainRemainingSeconds: number }> = {};
    for (const { seat, player } of seatedPlayers) {
        timers[seat] = { mainRemainingSeconds: player.actionTimer.mainTimeRemainingSeconds };
    }

    const saveTrigger = {
        kind: options.saveTrigger?.kind ?? 'immediate',
        requestedAtActionNumber: options.saveTrigger?.requestedAtActionNumber ?? game.actionNumber,
        requestedAtPhase: options.saveTrigger?.requestedAtPhase ?? (game.currentPhase ?? ''),
    };

    const document: ISavedMatch = {
        formatVersion: SAVED_MATCH_FORMAT_VERSION,
        cardDataVersion: options.cardDataVersion ?? null,
        savedAt: options.savedAt ?? new Date().toISOString(),
        saveTrigger,
        gameId: game.id,
        settings: {
            gameMode: game.gameMode,
            undoMode: game.snapshotManager.undoMode,
            useActionTimer: game.useActionTimer,
        },
        rng: {
            seed: game.randomSeed,
            state: game.randomGenerator.rngState,
        },
        game: {
            roundNumber: game.roundNumber,
            phase: game.currentPhase,
            initiativePlayer: game.initiativePlayer ? getSeatForPlayer(game.initiativePlayer) : null,
            actionPhaseActivePlayer: game.actionPhaseActivePlayer ? getSeatForPlayer(game.actionPhaseActivePlayer) : null,
            isInitiativeClaimed: game.isInitiativeClaimed,
            actionNumber: game.actionNumber,
            prevActionPhasePlayerPassed: game.prevActionPhasePlayerPassed,
        },
        players: savedPlayers,
        stateWatchers: watchers.sections,
        engineOnlyFacts,
        chat,
        timers,
    };

    assertCompleteness(expectedCards, refResolver, unrepresentedCards.declared, document);

    return document;
}

/**
 * Every card owned by either player that is currently in a zone must be accounted for: it appears exactly
 * once at a coordinate, or it is enumerated in `engineOnlyFacts` as an `unrepresentedCard`.
 * `SavedCardRefResolver.indexTopLevel`/`indexNested` already throw if the same live card is indexed twice,
 * so "present in the index" is equivalent to "appears exactly once" here; this only needs to check that
 * every expected card was either indexed at all or declared dropped. `collectExpectedCards` is deliberately
 * not the oracle AC1 uses: a check and a test sharing an oracle proves only self-consistency.
 *
 * Accepting a declared drop is not a relaxation of invariant 4 -- it is the degrade-with-manifest rule the
 * owning plan states, and the alternative the plan reserves for untrustworthy *coordinates*, not for state
 * the format cannot hold. What is still forbidden, and still hard-fails here, is a card that vanishes
 * without either: {@link buildUnrepresentedCardFacts} only ever declares a card nested under another card,
 * so a card missing from a plain zone remains exactly as loud as it was.
 */
function assertCompleteness(
    expectedCards: ReadonlySet<Card>,
    refResolver: SavedCardRefResolver,
    declaredUnrepresented: ReadonlySet<Card>,
    document: ISavedMatch
): void {
    for (const card of expectedCards) {
        if (refResolver.isIndexed(card) || declaredUnrepresented.has(card)) {
            continue;
        }

        throw new SaveIntegrityError(
            `Card "${card.internalName}" (uuid ${card.uuid}) is owned by a player and in a zone, but does not appear anywhere in the saved match and was not declared as an unrepresentedCard fact. Document formatVersion: ${document.formatVersion}.`
        );
    }
}
