import type { Card } from '../card/Card';
import type { IAttackableCard, ICardWithUpgrades } from '../card/CardInterfaces';
import type { InPlayCard } from '../card/baseClasses/InPlayCard';
import type { ICardWithExhaustProperty } from '../card/baseClasses/PlayableOrDeployableCard';
import { LeaderUnitCard } from '../card/LeaderUnitCard';
import type { Arena, TokenName } from '../Constants';
import { DeployType, DeckZoneDestination, KeywordName, TokenCardName, TokenUnitName, TokenUpgradeName, ZoneName } from '../Constants';
import type { Player } from '../Player';

/**
 * Thrown by the state-injection module when it cannot trust the board position it is about to build,
 * rather than silently building something else. Sibling of {@link SaveIntegrityError}
 * (`SavedMatchInterfaces.ts`) for the injection side of the pipeline; no spec asserts on its text (the
 * only `toThrowError` assertions over the ported helper methods are for `findCardByName`, which stays
 * test-side), so the type may evolve independently of that one.
 */
export class StateInjectionError extends Error {
    public constructor(message: string) {
        super(message);
        this.name = 'StateInjectionError';
    }
}

/**
 * Engine-side operations for placing cards into zones and setting per-card state, so a board position can
 * be built directly instead of being played out. Operates on already-resolved `Card` instances — name
 * resolution (a string plus a zone/side/ordinal to the right physical `Card`) stays with the caller; see
 * `docs/plans/02-semantic-save-load.md` work item C and `P2-C1`'s plan, §6.
 *
 * No operation here calls `game.resolveGameState`, `game.continue`, or touches the snapshot manager.
 * Callers batch and refresh once.
 *
 * Error channel: every violation this module detects is a caller/input-shape mistake — the request asked
 * for a board position that cannot exist (wrong arena for a card, a leader that isn't deployable, a player
 * who already has the Force, a negative count, and so on) — never an internal engine invariant, since this
 * module does not run mid-pipeline where the engine's own state could already be inconsistent. Every such
 * check therefore throws {@link StateInjectionError}, not `Contract`, so `P2-C2` can discriminate "this save
 * document is bad" from "the engine is broken" with `e instanceof StateInjectionError`. `Contract` remains
 * reserved for helper functions elsewhere (e.g. `InPlayCard.setMostRecentInPlayIdForStateInjection`,
 * `Damage.setDamageForStateInjection`) that guard a primitive's own value domain regardless of caller.
 */

/** Removes a card from whichever concrete arena zone it currently occupies. Both arena zones are shared
 * across both players (a `Card`'s `.zone` is typed as the full `Zone` union, most of whose members do not
 * expose `removeCard`), so the concrete zone is selected by the card's own `zoneName` rather than by a
 * union-typed `.zone.removeCard(...)` call. */
function removeCardFromItsArenaZone(player: Player, card: Card): void {
    const arenaZone = card.zoneName === ZoneName.GroundArena ? player.game.groundArena : player.game.spaceArena;
    arenaZone.removeCard(card);
}

/**
 * Clears arena, resource, discard, hand and deck zones and re-parents every removed card to
 * `player.outsideTheGameZone` in one batch. Direct port of the mechanics formerly in
 * `PlayerInteractionWrapper.moveAllNonBaseZonesToRemoved`: a batched re-parent (via
 * {@link Card.setZoneForStateInjectionBatch} and `outsideZone.addCards`) rather than N individual
 * `moveTo` calls, since this runs at the start of nearly every spec. Does **not** refresh game state.
 */
export function moveAllNonBaseZonesToStaging(player: Player): void {
    const arenaCards: Card[] = player.getArenaCards();
    const resourceCards: Card[] = player.resourceZone.clearCards();
    const discardCards: Card[] = player.discardZone.clearCards();
    const handCards: Card[] = player.handZone.clearCards();
    const deckCards: Card[] = player.deckZone.clearDeck();

    for (const card of arenaCards) {
        removeCardFromItsArenaZone(player, card);
    }

    const allCards: Card[] = [...arenaCards, ...resourceCards, ...discardCards, ...handCards, ...deckCards];

    const outsideZone = player.outsideTheGameZone;
    for (const card of allCards) {
        card.setZoneForStateInjectionBatch(outsideZone);
    }
    outsideZone.addCards(allCards);
}

/** Current hand → deck top; then each of `cards` → hand, in order. */
export function setHand(player: Player, cards: readonly Card[]): void {
    for (const card of [...player.handZone.cards]) {
        card.moveTo(DeckZoneDestination.DeckTop);
    }
    for (const card of cards) {
        card.moveTo(ZoneName.Hand);
    }
}

/** Current deck → `outsideTheGame`; then `cards` placed so `cards[0]` ends on top. */
export function setDeck(player: Player, cards: readonly Card[]): void {
    for (const card of [...player.deckZone.cards]) {
        card.moveTo(ZoneName.OutsideTheGame);
    }
    // Iterates a copy in reverse rather than reversing the caller's array in place.
    for (const card of [...cards].reverse()) {
        card.moveTo(DeckZoneDestination.DeckTop);
    }
}

/** Current discard → deck top; then `cards` placed in the same reverse order as {@link setDeck}. */
export function setDiscard(player: Player, cards: readonly Card[]): void {
    for (const card of [...player.discardZone.cards]) {
        card.moveTo(DeckZoneDestination.DeckTop);
    }
    for (const card of [...cards].reverse()) {
        card.moveTo(ZoneName.Discard);
    }
}

export interface IResourceEntry {
    card: ICardWithExhaustProperty;
    exhausted?: boolean;
}

/** Current resources → deck top; then each entry → resource zone (same reverse ordering as {@link setDeck}). */
export function setResources(player: Player, entries: readonly IResourceEntry[]): void {
    for (const card of [...player.resourceZone.cards]) {
        card.moveTo(DeckZoneDestination.DeckTop);
    }
    for (const entry of [...entries].reverse()) {
        entry.card.moveTo(ZoneName.Resource);
        entry.card.exhausted = entry.exhausted ?? false;
    }
}

/**
 * Establishes `cards` as the `outsideTheGame` zone's contents **in the given order**. For a card not
 * already in the zone, `moveTo` performs the (appending) zone transition. For a card already in the zone,
 * `moveTo` would silently no-op (it early-returns when the target zone is the card's current zone), so
 * this instead removes and re-adds it to shift it to the tail. After the pass, the listed cards occupy the
 * tail of the zone in order; any unlisted residue is the prefix, which {@link assertStagingZoneMatches}
 * then reports. `outsideTheGame` order is a saved fact (`MatchSerializer` indexes it by ordinal), so this
 * ordering is load-bearing, not cosmetic.
 */
export function setOutsideTheGame(player: Player, cards: readonly Card[]): void {
    const outsideZone = player.outsideTheGameZone;

    for (const card of cards) {
        if (outsideZone.cards.includes(card)) {
            outsideZone.removeCard(card);
            outsideZone.addCard(card);
        } else {
            card.moveTo(ZoneName.OutsideTheGame);
        }
    }
}

/**
 * Compares `player.outsideTheGameZone.cards` (by internal name) against `expectedInternalNames`,
 * **in order**. A multiset comparison would pass a zone whose ordinals no longer match a save document's,
 * silently re-pointing any watcher ref that resolves against this zone at the wrong card — so exact
 * ordered equality is the primary check, and the error path distinguishes three failure modes: unexpected
 * residue, missing expected entries, and a right-multiset-wrong-order mismatch. Correctly handles
 * duplicate card names (two copies of one card) via counted, not set, membership.
 */
export function assertStagingZoneMatches(player: Player, expectedInternalNames: readonly string[]): void {
    const actualInternalNames = player.outsideTheGameZone.cards.map((card) => card.internalName);

    if (
        actualInternalNames.length === expectedInternalNames.length &&
        actualInternalNames.every((name, i) => name === expectedInternalNames[i])
    ) {
        return;
    }

    const actualCounts = countByName(actualInternalNames);
    const expectedCounts = countByName(expectedInternalNames);

    const residue = multisetDifference(actualCounts, expectedCounts);
    const missing = multisetDifference(expectedCounts, actualCounts);

    if (residue.length > 0 || missing.length > 0) {
        const parts: string[] = [];
        if (residue.length > 0) {
            parts.push(`unexpected cards present: [${residue.join(', ')}]`);
        }
        if (missing.length > 0) {
            parts.push(`expected cards absent: [${missing.join(', ')}]`);
        }

        throw new StateInjectionError(
            `outsideTheGame zone for player '${player.name}' does not match the expected contents (${parts.join('; ')}). ` +
            `Actual: [${actualInternalNames.join(', ')}]. Expected: [${expectedInternalNames.join(', ')}].`
        );
    }

    // Same cards, same counts, different order.
    throw new StateInjectionError(
        `outsideTheGame zone for player '${player.name}' has the expected cards but in the wrong order. ` +
        `Actual: [${actualInternalNames.join(', ')}]. Expected: [${expectedInternalNames.join(', ')}].`
    );
}

function countByName(names: readonly string[]): Map<string, number> {
    const counts = new Map<string, number>();
    for (const name of names) {
        counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return counts;
}

/** Names present in `from` more times than in `subtract`, repeated by the size of the shortfall. */
function multisetDifference(from: Map<string, number>, subtract: Map<string, number>): string[] {
    const result: string[] = [];
    for (const [name, count] of from) {
        const excess = count - (subtract.get(name) ?? 0);
        for (let i = 0; i < excess; i++) {
            result.push(name);
        }
    }
    return result;
}

export interface IArenaUnitEntry {
    card: Card;

    /** When provided and different from the card's owner, the card is put under this controller. */
    controller?: Player;
    exhausted?: boolean;
    damage?: number;
    upgrades?: readonly InPlayCard[];
    capturedUnits?: readonly Card[];
}

/**
 * Every card currently controlled by `player` in `arena` → deck top; then per entry: move to `arena`;
 * `takeControl` when `entry.controller` differs from the card's owner; exhaust/ready; write damage once;
 * then attach upgrades and captures. The ported helper wrote damage twice — once before upgrade/capture
 * attachment, once after, same value. Collapsing to one write keeps the *first* write (not the second):
 * `attachTo` can run an attach-condition that reads the target's current damage (e.g. Mark My Words
 * requires `attachTarget.damage > 0`), so damage must already be set before upgrades attach. The dropped
 * write is genuinely dead — same value, non-clamping setter — only because it was the *second* one.
 */
export function setArenaUnits(player: Player, arena: Arena, entries: readonly IArenaUnitEntry[]): void {
    for (const card of [...player.getArenaCards({ arena })]) {
        card.moveTo(DeckZoneDestination.DeckTop);
    }

    for (const entry of entries) {
        const rawCard = entry.card;

        if (!rawCard.isUnit()) {
            throw new StateInjectionError(`Attempting to place non-unit card '${rawCard.internalName}' into arena '${arena}'`);
        }

        const card = rawCard;
        if (card.defaultArena !== arena) {
            throw new StateInjectionError(`Attempting to place '${card.internalName}' in invalid arena '${arena}'`);
        }

        card.moveTo(arena);

        if (entry.controller != null && entry.controller !== card.owner) {
            card.takeControl(entry.controller);
        }

        if (entry.exhausted) {
            card.exhaust();
        } else {
            card.ready();
        }

        // Damage is written before upgrades/captures attach, not after: some upgrades' attach conditions
        // read the target's *current* damage during `attachTo` (e.g. Mark My Words requires
        // `attachTarget.damage > 0`), so the write order is observable, not just the final stored value.
        // The ported helper's second (post-attachment) write was the one that was truly dead — same
        // value, non-clamping setter — so it is the one dropped here, not the first.
        card.setDamageForStateInjection(entry.damage ?? 0);

        if (entry.upgrades) {
            for (const upgrade of entry.upgrades) {
                attachUpgrade(upgrade, card);
            }
        }

        if (entry.capturedUnits) {
            for (const capturedUnit of entry.capturedUnits) {
                captureCard(capturedUnit, card);
            }
        }
    }
}

/**
 * Attaches `upgrade` to `parent`, guarding the same Fortify legality rule the ported helper enforced:
 * a Fortify upgrade attaches only to a base, and a non-Fortify upgrade only to a non-base.
 */
export function attachUpgrade(upgrade: InPlayCard, parent: ICardWithUpgrades): void {
    const hasFortify = upgrade.hasSomeKeyword(KeywordName.Fortify);
    const parentIsBase = parent.isBase();

    if (parentIsBase && !hasFortify) {
        throw new StateInjectionError(`Attempting to attach upgrade '${upgrade.internalName}' to a base, but it does not have the Fortify keyword`);
    }
    if (!parentIsBase && hasFortify) {
        throw new StateInjectionError(`Attempting to attach Fortify upgrade '${upgrade.internalName}' to non-base card '${parent.internalName}'`);
    }

    upgrade.attachTo(parent);
}

/** Rejects a token unit, as the ported helper did — a token has no card identity to capture by. */
export function captureCard(card: Card, captor: IAttackableCard): void {
    if (card.isTokenUnit()) {
        throw new StateInjectionError(`Attempting to add token unit '${card.internalName}' to a capture zone`);
    }
    if (!card.isUnit()) {
        throw new StateInjectionError(`Attempting to add non-unit card '${card.internalName}' to a capture zone`);
    }

    card.moveToCaptureZone(captor.captureZone);
}

export interface ISetLeaderStatusOptions {
    deployed?: boolean;
    damage?: number;
    exhausted?: boolean;

    /** Applies only to a `DoubleSidedLeaderCard`; flips only when it differs from the current side. */
    onStartingSide?: boolean;
}

/**
 * Sets deploy/damage/exhaust state on `player.deckLeader`. Touches **no** ability limit — advancing the
 * deploy-action limit is a separate, explicit operation ({@link markLeaderDeployUsed}), never implicit
 * bookkeeping here. `onStartingSide` is declarative (unlike the ported helper's toggle-style `flipped`)
 * and applies only to a `DoubleSidedLeaderCard`.
 */
export function setLeaderStatus(player: Player, state: ISetLeaderStatusOptions): void {
    const leader = player.deckLeader;

    if (state.deployed) {
        if (!(leader instanceof LeaderUnitCard)) {
            throw new StateInjectionError(`Attempting to deploy '${leader.internalName}' but it is not a deployable leader`);
        }

        leader.deploy({ type: DeployType.LeaderUnit });
        leader.setDamageForStateInjection(state.damage ?? 0);
        leader.exhausted = state.exhausted ?? false;
    } else {
        // Matches the ported helper's asymmetry: an explicit `deployed: false` attempts an undeploy (only
        // if the leader is actually a deployable leader that is currently deployed); an unspecified
        // `deployed` never attempts one, even if the leader somehow started out deployed.
        if (state.deployed === false && leader instanceof LeaderUnitCard && leader.deployed) {
            leader.undeploy();
        }

        if (state.damage) {
            throw new StateInjectionError(`Leader '${leader.internalName}' should not have damage when not deployed`);
        }
        leader.exhausted = state.exhausted ?? false;
    }

    if (state.onStartingSide != null) {
        if (!leader.isDoubleSidedLeader()) {
            throw new StateInjectionError(`Attempting to set 'onStartingSide' on '${leader.internalName}' but it is not a double-sided leader`);
        }

        if (leader.onStartingSide !== state.onStartingSide) {
            leader.flipLeader();
        }
    }
}

/**
 * Advances the leader's deploy-action epic-action-limit by one increment, identified by instance handle
 * (`LeaderUnitCard.deployEpicActionLimit`) rather than by walking action abilities — both of a
 * pilot-capable leader's deploy actions share one limit instance, so a per-ability walk would double-count.
 * Used by the test wrapper to restore the old net behavior of the ported helper (which implicitly spent
 * this limit on deploy); **not** used by `P2-C2`, whose restore pass owns all limit counts.
 */
export function markLeaderDeployUsed(player: Player): void {
    const leader = player.deckLeader;

    if (!(leader instanceof LeaderUnitCard)) {
        throw new StateInjectionError(`Attempting to mark the deploy action used for '${leader.internalName}' but it is not a deployable leader`);
    }

    const limit = leader.deployEpicActionLimit;
    if (limit == null || !limit.isEpicActionLimit()) {
        throw new StateInjectionError(`Leader '${leader.internalName}' has no epic deploy action limit to mark used`);
    }

    limit.increment(player);
}

export interface ISetBaseStatusOptions {
    damage?: number;
}

/** Sets base damage. Upgrades and captures go through {@link attachUpgrade}/{@link captureCard}, as the caller already does for arena units. */
export function setBaseStatus(player: Player, state: ISetBaseStatusOptions): void {
    player.base.setDamageForStateInjection(state.damage ?? 0);
}

/** Force token `outsideTheGame` ⇄ `base`, with the same "already has it" / "doesn't have it" / "no token found" rejections the ported helper had. */
export function setHasTheForce(player: Player, hasForce: boolean): void {
    if (hasForce) {
        if (player.hasTheForce) {
            throw new StateInjectionError(`Attempting to give Force Token to '${player.name}', but they already have it`);
        }

        const forceTokens = player.outsideTheGameZone.getCards({ condition: (card) => card.isForceToken() });
        if (forceTokens.length === 0) {
            throw new StateInjectionError(`Failed to find a Force Token for '${player.name}'`);
        }

        forceTokens[0].moveTo(ZoneName.Base);
    } else {
        if (!player.hasTheForce) {
            throw new StateInjectionError(`Attempting to remove Force Token from '${player.name}', but they don't have it`);
        }

        const forceToken = player.baseZone.forceToken;
        if (forceToken == null) {
            throw new StateInjectionError(`Failed to find a Force Token for '${player.name}'`);
        }

        forceToken.moveTo(ZoneName.OutsideTheGame);
    }
}

/**
 * Brings the base zone's credit count to exactly `count`: removes the surplus to `outsideTheGame`, or
 * generates and places exactly `count - current` new tokens. The ported helper generated `count` tokens
 * unconditionally in the "add" branch (an off-by-`current` defect, unreachable there because every live
 * caller started from zero); this does not carry that defect forward.
 */
export function setCreditTokenCount(player: Player, count: number): void {
    if (count < 0) {
        throw new StateInjectionError(`Attempting to set '${player.name}'s credit token count to a negative value (${count})`);
    }

    const currentCount = player.creditTokenCount;

    if (count < currentCount) {
        const tokensToRemove = player.baseZone.credits.slice(0, currentCount - count);
        for (const token of tokensToRemove) {
            token.moveTo(ZoneName.OutsideTheGame);
        }
        return;
    }

    const tokensToAdd = count - currentCount;
    for (let i = 0; i < tokensToAdd; i++) {
        const token = player.game.generateToken(player, TokenCardName.Credit);
        token.moveTo(ZoneName.Base);
    }
}

/**
 * Write path for a card's `_mostRecentInPlayId`, delegating to {@link InPlayCard.setMostRecentInPlayIdForStateInjection}
 * (which enforces the getter's own zone predicate). See that method's doc comment, and §3.4 / B4 of
 * `P2-C1`'s plan, for why the predicate must be exactly
 * `!isInPlay() && zone != null && zone.hiddenForPlayers == null`.
 */
export function setMostRecentInPlayId(card: InPlayCard, value: number): void {
    card.setMostRecentInPlayIdForStateInjection(value);
}

const TOKEN_UNIT_NAMES_BY_INTERNAL_NAME: Readonly<Record<string, TokenUnitName>> = {
    'battle-droid': TokenUnitName.BattleDroid,
    'clone-trooper': TokenUnitName.CloneTrooper,
    spy: TokenUnitName.Spy,
    mandalorian: TokenUnitName.Mandalorian,
    beast: TokenUnitName.Beast,
    'tie-fighter': TokenUnitName.TIEFighter,
    xwing: TokenUnitName.XWing,
};

const TOKEN_UPGRADE_NAMES_BY_INTERNAL_NAME: Readonly<Record<string, TokenUpgradeName>> = {
    experience: TokenUpgradeName.Experience,
    shield: TokenUpgradeName.Shield,
    advantage: TokenUpgradeName.Advantage,
    weakness: TokenUpgradeName.Weakness,
};

const TOKEN_CARD_NAMES_BY_INTERNAL_NAME: Readonly<Record<string, TokenCardName>> = {
    'the-force': TokenCardName.Force,
    credit: TokenCardName.Credit,
};

/** Exactly the 7 names `Util.isTokenUnit` listed (verified name for name); no other name is a unit token. */
export function isTokenUnitName(internalName: string): boolean {
    return internalName in TOKEN_UNIT_NAMES_BY_INTERNAL_NAME;
}

/** Exactly the 4 names `Util.isTokenUpgrade` listed; no other name is an upgrade token. */
export function isTokenUpgradeName(internalName: string): boolean {
    return internalName in TOKEN_UPGRADE_NAMES_BY_INTERNAL_NAME;
}

/** `the-force` and `credit` only — reachable through neither {@link isTokenUnitName} nor {@link isTokenUpgradeName}. */
export function isTokenCardName(internalName: string): boolean {
    return internalName in TOKEN_CARD_NAMES_BY_INTERNAL_NAME;
}

/**
 * One explicit internal-name → `TokenName` table, split into three groups keyed to `TokenUnitName`,
 * `TokenUpgradeName` and `TokenCardName` — a table rather than a derivation, because e.g. `battle-droid`
 * (the internal name) does not equal `battleDroid` (the enum value `Game.generateToken` expects).
 * Deliberately no single "is in the token table" predicate — see {@link isTokenUnitName} /
 * {@link isTokenUpgradeName} / {@link isTokenCardName} above.
 */
export function resolveTokenName(internalName: string): TokenName {
    if (internalName in TOKEN_UNIT_NAMES_BY_INTERNAL_NAME) {
        return TOKEN_UNIT_NAMES_BY_INTERNAL_NAME[internalName];
    }
    if (internalName in TOKEN_UPGRADE_NAMES_BY_INTERNAL_NAME) {
        return TOKEN_UPGRADE_NAMES_BY_INTERNAL_NAME[internalName];
    }
    if (internalName in TOKEN_CARD_NAMES_BY_INTERNAL_NAME) {
        return TOKEN_CARD_NAMES_BY_INTERNAL_NAME[internalName];
    }

    throw new StateInjectionError(`Unknown token type: '${internalName}'`);
}

/** Generates a token card of the type named by `internalName`, in `player.outsideTheGameZone`. */
export function generateToken(player: Player, internalName: string): Card {
    return player.game.generateToken(player, resolveTokenName(internalName));
}
