import { StateWatcherName } from '../Constants';
import type { Game } from '../Game';
import type { StateWatcher } from '../stateWatcher/StateWatcher';
import { StateWatcherLibrary } from '../../stateWatchers/StateWatcherLibrary';
import type { LoadedPositionIndex } from './LoadedPositionIndex';
import { MatchLoadError } from './MatchLoadError';
import { SaveIntegrityError } from './SavedMatchInterfaces';
import type {
    ISavedCardLeftPlayEntry,
    ISavedCreatedTokenEntry,
    ISavedDamageDealtEntry,
    ISavedDamagedUnitEntry,
    ISavedDefeatedCardEntry,
    ISavedDeployedLeaderEntry,
    ISavedDiscardedCardEntry,
    ISavedDrawnCardEntry,
    ISavedEnteredCardEntry,
    ISavedForceUsedEntry,
    ISavedHealedUnitEntry,
    ISavedMatch,
    ISavedPlayedCardEntry,
    ISavedStateWatcherSection,
    ISavedWatcherEntry,
    SavedCounterSpaceName,
} from './SavedMatchInterfaces';
import {
    decodeCounter,
    decodeLastKnownInformation,
    decodeOptionalReferent,
    decodeOptionalSeat,
    decodeRequiredReferent,
    decodeRequiredReferents,
    decodeSeat,
    decodeStint,
    decodeTaggedSet,
} from './WatcherEntryDecoding';
import type { IWatcherDecodeContext } from './WatcherEntryDecoding';
import { deriveCounterSpaceSizes } from './WatcherEntryEncoding';
import type { Player } from '../Player';
import type { ActionEntry } from '../../stateWatchers/ActionsThisPhaseWatcher';
import type { AttackEntry } from '../../stateWatchers/AttacksThisPhaseWatcher';
import type { HealedBaseEntry } from '../../stateWatchers/BasesHealedThisPhaseWatcher';
import type { DefeatedCardEntry } from '../../stateWatchers/CardsDefeatedThisPhaseWatcher';
import type { DiscardedCardEntry } from '../../stateWatchers/CardsDiscardedThisPhaseWatcher';
import type { DrawnCardEntry } from '../../stateWatchers/CardsDrawnThisPhaseWatcher';
import type { EnteredCardEntry } from '../../stateWatchers/CardsEnteredPlayThisPhaseWatcher';
import type { CardLeftPlayEntry } from '../../stateWatchers/CardsLeftPlayThisPhaseWatcher';
import type { PlayedCardEntry } from '../../stateWatchers/CardsPlayedThisPhaseWatcher';
import type { DamageDealtEntry } from '../../stateWatchers/DamageDealtThisPhaseWatcher';
import type { ForceUsedEntry } from '../../stateWatchers/ForceUsedThisPhaseWatcher';
import type { DeployedLeaderEntry } from '../../stateWatchers/LeadersDeployedThisPhaseWatcher';
import type { CreatedTokenEntry } from '../../stateWatchers/TokensCreatedThisPhaseWatcher';
import type { DamagedUnitEntry } from '../../stateWatchers/UnitsDamagedThisPhaseWatcher';
import type { HealedUnitEntry } from '../../stateWatchers/UnitsHealedThisPhaseWatcher';

type WatcherDecoder<TSaved, TEntry> = (saved: TSaved, context: IWatcherDecodeContext) => TEntry;

/** A saved `lastKnownInformation` is documented as `null` meaning "absent, never degraded", but every reachable producer of these five entry shapes populates it; treat a genuinely null one as a document integrity problem rather than guessing a value. */
function requireLki(saved: Parameters<typeof decodeLastKnownInformation>[0], fieldOwner: string) {
    const decoded = decodeLastKnownInformation(saved);
    if (decoded == null) {
        throw new MatchLoadError(`${fieldOwner}'s lastKnownInformation was saved as null, but the live entry shape requires it.`);
    }
    return decoded;
}

function decodeAction(saved: ISavedWatcherEntry & { player: string; actionNumber: number }, context: IWatcherDecodeContext): ActionEntry {
    return {
        player: decodeSeat(context, saved.player).getObjectId(),
        actionNumber: saved.actionNumber,
    };
}

function decodeAttack(saved: Extract<ISavedWatcherEntry, { attacker: unknown }>, context: IWatcherDecodeContext): AttackEntry {
    const attacker = decodeRequiredReferent(context, saved.attacker);
    const attackerInPlayId = decodeStint(saved.attackerInPlayId, attacker);
    if (attackerInPlayId == null) {
        throw new MatchLoadError('A saved attack entry has no resolvable attackerInPlayId.');
    }

    return {
        attacker: attacker.getObjectId() as any,
        attackerInPlayId,
        attackerAttributes: { traits: decodeTaggedSet(saved.attackerAttributes?.traits ?? { $set: [] }) } as any,
        attackingPlayer: decodeSeat(context, saved.attackingPlayer).getObjectId(),
        targets: decodeRequiredReferents(context, saved.targets).map((card) => card.getObjectId()) as any,
        targetInPlayId: undefined,
        defendingPlayer: decodeSeat(context, saved.defendingPlayer).getObjectId(),
        actionNumber: saved.actionNumber,
        attackId: decodeCounter(saved.attackId, context.counterSpaceSizes.attackIds),
    };
}

function decodeHealedBase(saved: HealedBaseEntryLike, context: IWatcherDecodeContext): HealedBaseEntry {
    return { base: decodeRequiredReferent(context, saved.base).getObjectId() as any };
}
interface HealedBaseEntryLike {
    base: Parameters<typeof decodeRequiredReferent>[1];
}

function decodeDefeatedCard(saved: ISavedDefeatedCardEntry, context: IWatcherDecodeContext): DefeatedCardEntry {
    const card = decodeRequiredReferent(context, saved.card);
    const inPlayId = decodeStint(saved.inPlayId, card);
    if (inPlayId == null) {
        throw new MatchLoadError('A saved defeated-card entry has no resolvable inPlayId.');
    }

    return {
        card: card.getObjectId() as any,
        inPlayId,
        controlledBy: decodeSeat(context, saved.controlledBy).getObjectId(),
        defeatedBy: decodeOptionalSeat(context, saved.defeatedBy)?.getObjectId(),
        wasDefeatedWhileAttacking: saved.wasDefeatedWhileAttacking,
        lastKnownInformation: requireLki(saved.lastKnownInformation, 'CardsDefeatedThisPhase entry'),
    };
}

function decodeDiscardedCard(saved: ISavedDiscardedCardEntry, context: IWatcherDecodeContext): DiscardedCardEntry {
    const card = decodeRequiredReferent(context, saved.card);
    const discardedPlayId = decodeStint(saved.discardedPlayId, card);
    if (discardedPlayId == null) {
        throw new MatchLoadError('A saved discarded-card entry has no resolvable discardedPlayId.');
    }

    return {
        card: card.getObjectId() as any,
        discardedFromPlayer: decodeSeat(context, saved.discardedFromPlayer).getObjectId(),
        discardedFromZone: saved.discardedFromZone,
        discardedPlayId,
    };
}

function decodeDrawnCard(saved: ISavedDrawnCardEntry, context: IWatcherDecodeContext): DrawnCardEntry {
    return {
        player: decodeSeat(context, saved.player).getObjectId(),
        card: decodeRequiredReferent(context, saved.card).getObjectId() as any,
    };
}

function decodeEnteredCard(saved: ISavedEnteredCardEntry, context: IWatcherDecodeContext): EnteredCardEntry {
    return {
        card: decodeRequiredReferent(context, saved.card).getObjectId() as any,
        playedBy: decodeSeat(context, saved.playedBy).getObjectId(),
    };
}

function decodeCardLeftPlay(saved: ISavedCardLeftPlayEntry, context: IWatcherDecodeContext): CardLeftPlayEntry {
    const card = decodeRequiredReferent(context, saved.card);

    return {
        card: card.getObjectId() as any,
        controlledBy: decodeSeat(context, saved.controlledBy).getObjectId(),
        lastKnownInformation: requireLki(saved.lastKnownInformation, 'CardsLeftPlayThisPhase entry'),
        inPlayId: decodeStint(saved.inPlayId, card) ?? undefined,
    };
}

function decodePlayedCard(saved: ISavedPlayedCardEntry, context: IWatcherDecodeContext): PlayedCardEntry {
    const card = decodeRequiredReferent(context, saved.card);
    const parentCard = decodeOptionalReferent(context, saved.parentCard);

    return {
        card: card.getObjectId() as any,
        playEventId: decodeCounter(saved.playEventId, context.counterSpaceSizes.gameEventIds),
        originalZone: saved.originalZone ?? undefined,
        inPlayId: decodeStint(saved.inPlayId, card) ?? undefined,
        playedBy: decodeSeat(context, saved.playedBy).getObjectId(),
        parentCard: parentCard?.getObjectId() as any,
        parentCardInPlayId: decodeStint(saved.parentCardInPlayId, parentCard) ?? undefined,
        hasWhenDefeatedAbilities: saved.hasWhenDefeatedAbilities ?? undefined,
        playedAsType: saved.playedAsType,
    };
}

function decodeDamageDealt(saved: ISavedDamageDealtEntry, context: IWatcherDecodeContext): DamageDealtEntry {
    const damageSourceCards = decodeRequiredReferents(context, saved.damageSourceCards);
    const damageSourceInPlayIds = damageSourceCards.map((source, i) => decodeStint(saved.damageSourceInPlayIds[i], source) ?? undefined);

    return {
        damageType: saved.damageType,
        damageSourceCards: damageSourceCards.map((c) => c.getObjectId()) as any,
        damageSourceInPlayIds,
        damageSourceCardTypes: [...saved.damageSourceCardTypes],
        damageSourcePlayer: decodeOptionalSeat(context, saved.damageSourcePlayer)?.getObjectId(),
        damageSourceEventId: undefined,
        targets: decodeRequiredReferents(context, saved.targets).map((c) => c.getObjectId()) as any,
        targetType: saved.targetType,
        targetController: decodeOptionalSeat(context, saved.targetController)?.getObjectId(),
        amount: saved.amount,
        isIndirect: saved.isIndirect ?? undefined,
        activeAttackId: decodeCounter(saved.activeAttackId, context.counterSpaceSizes.attackIds) ?? undefined,
    };
}

function decodeForceUsed(saved: ISavedForceUsedEntry, context: IWatcherDecodeContext): ForceUsedEntry {
    return { player: decodeSeat(context, saved.player).getObjectId() };
}

function decodeDeployedLeader(saved: ISavedDeployedLeaderEntry, context: IWatcherDecodeContext): DeployedLeaderEntry {
    return { card: decodeRequiredReferent(context, saved.card).getObjectId() as any };
}

function decodeCreatedToken(saved: ISavedCreatedTokenEntry, context: IWatcherDecodeContext): CreatedTokenEntry {
    return {
        token: decodeRequiredReferent(context, saved.token).getObjectId() as any,
        createdBy: decodeSeat(context, saved.createdBy).getObjectId(),
    };
}

function decodeDamagedUnit(saved: ISavedDamagedUnitEntry, context: IWatcherDecodeContext): DamagedUnitEntry {
    const unit = decodeRequiredReferent(context, saved.unit);
    const inPlayId = decodeStint(saved.inPlayId, unit);
    if (inPlayId == null) {
        throw new MatchLoadError('A saved damaged-unit entry has no resolvable inPlayId.');
    }
    return {
        unit: unit.getObjectId() as any,
        inPlayId,
        controlledBy: decodeSeat(context, saved.controlledBy).getObjectId(),
    };
}

function decodeHealedUnit(saved: ISavedHealedUnitEntry, context: IWatcherDecodeContext): HealedUnitEntry {
    const unit = decodeRequiredReferent(context, saved.unit);
    const inPlayId = decodeStint(saved.inPlayId, unit);
    if (inPlayId == null) {
        throw new MatchLoadError('A saved healed-unit entry has no resolvable inPlayId.');
    }
    return {
        unit: unit.getObjectId() as any,
        inPlayId,
        controlledBy: decodeSeat(context, saved.controlledBy).getObjectId(),
    };
}

/**
 * One decoder per watcher, mirroring `StateWatcherSerializer.watcherEncoders`'s exhaustiveness trick: the
 * mapped type over `StateWatcherName` makes a watcher added to the enum without a decoder fail to build.
 */
type WatcherDecoderRegistry = {
    [TName in StateWatcherName]: WatcherDecoder<any, any>;
};

const watcherDecoders: WatcherDecoderRegistry = {
    [StateWatcherName.ActionsThisPhase]: decodeAction,
    [StateWatcherName.AttacksThisPhase]: decodeAttack,
    [StateWatcherName.BasesHealedThisPhase]: decodeHealedBase,
    [StateWatcherName.CardsDefeatedThisPhase]: decodeDefeatedCard,
    [StateWatcherName.CardsDiscardedThisPhase]: decodeDiscardedCard,
    [StateWatcherName.CardsDrawnThisPhase]: decodeDrawnCard,
    [StateWatcherName.CardsEnteredPlayThisPhase]: decodeEnteredCard,
    [StateWatcherName.CardsLeftPlayThisPhase]: decodeCardLeftPlay,
    [StateWatcherName.CardsPlayedThisPhase]: decodePlayedCard,
    [StateWatcherName.DamageDealtThisPhase]: decodeDamageDealt,
    [StateWatcherName.ForceUsedThisPhase]: decodeForceUsed,
    [StateWatcherName.LeadersDeployedThisPhase]: decodeDeployedLeader,
    [StateWatcherName.TokensCreatedThisPhase]: decodeCreatedToken,
    [StateWatcherName.UnitsDamagedThisPhase]: decodeDamagedUnit,
    [StateWatcherName.UnitsHealedThisPhase]: decodeHealedUnit,
};

/** The decoder registry's keys, exposed so a spec can assert at runtime that they still match the enum. */
export function registeredWatcherDecoderNames(): string[] {
    return Object.keys(watcherDecoders);
}

/**
 * On-demand watcher registration table: a production game built from the same decklists registers only the
 * watchers its cards need, but a document can name any watcher (e.g. one built via
 * `GameStateBuilder.registerAllStateWatchers`). `registerWatcher` is idempotent, so registering on demand
 * costs nothing when the watcher is already registered, and rejecting an unregistered section would make
 * every such save unloadable (§8 decision 3 of the owning plan).
 */
const watcherRegistrationByName: Readonly<Record<StateWatcherName, (library: StateWatcherLibrary) => StateWatcher>> = {
    [StateWatcherName.ActionsThisPhase]: (library) => library.actionsThisPhase(),
    [StateWatcherName.AttacksThisPhase]: (library) => library.attacksThisPhase(),
    [StateWatcherName.BasesHealedThisPhase]: (library) => library.basesHealedThisPhase(),
    [StateWatcherName.CardsDefeatedThisPhase]: (library) => library.cardsDefeatedThisPhase(),
    [StateWatcherName.CardsDiscardedThisPhase]: (library) => library.cardsDiscardedThisPhase(),
    [StateWatcherName.CardsDrawnThisPhase]: (library) => library.cardsDrawnThisPhase(),
    [StateWatcherName.CardsEnteredPlayThisPhase]: (library) => library.cardsEnteredPlayThisPhase(),
    [StateWatcherName.CardsLeftPlayThisPhase]: (library) => library.cardsLeftPlayThisPhase(),
    [StateWatcherName.CardsPlayedThisPhase]: (library) => library.cardsPlayedThisPhase(),
    [StateWatcherName.DamageDealtThisPhase]: (library) => library.damageDealtThisPhase(),
    [StateWatcherName.ForceUsedThisPhase]: (library) => library.forceUsedThisPhase(),
    [StateWatcherName.LeadersDeployedThisPhase]: (library) => library.leadersDeployedThisPhase(),
    [StateWatcherName.TokensCreatedThisPhase]: (library) => library.tokensCreatedThisPhase(),
    [StateWatcherName.UnitsDamagedThisPhase]: (library) => library.unitsDamagedThisPhase(),
    [StateWatcherName.UnitsHealedThisPhase]: (library) => library.unitsHealedThisPhase(),
};

/**
 * Restores every section of `document.stateWatchers` into `game`, after position injection (every stint
 * field is resolved against the loaded card's own live key, which requires the card already be placed).
 * Counter ordinals are derived once for the whole document, per `deriveCounterSpaceSizes`'s own contract.
 */
export function restoreStateWatchers(game: Game, document: ISavedMatch, index: LoadedPositionIndex, playerBySeat: ReadonlyMap<string, Player>): void {
    let counterSpaceSizes: Record<SavedCounterSpaceName, number>;
    try {
        counterSpaceSizes = deriveCounterSpaceSizes(document);
    } catch (error) {
        // deriveCounterSpaceSizes throws SaveIntegrityError, which is not a MatchLoadError; every load-side
        // failure must be one exception type.
        if (error instanceof SaveIntegrityError) {
            throw new MatchLoadError(error.message, { cause: error });
        }
        throw error;
    }
    const context: IWatcherDecodeContext = { index, playerBySeat, counterSpaceSizes };
    const library = new StateWatcherLibrary(game);

    for (const section of document.stateWatchers ?? []) {
        // `Object.prototype.hasOwnProperty` guards, not just `== null`: a plain object literal used as a
        // registry answers a lookup for 'constructor', '__proto__', or 'toString' with an inherited
        // `Object.prototype` member (a function, not `null`), so an untrusted `section.watcher` string
        // reaching either registry as a bare index would pass the `== null` check and then be invoked or
        // treated as a decoder/registration function, producing a confusing raw `TypeError` instead of a
        // clean rejection naming the actual (unregistered-watcher) cause.
        if (!Object.prototype.hasOwnProperty.call(watcherDecoders, section.watcher)) {
            throw new MatchLoadError(`State watcher "${section.watcher}" has no load-format decoder.`);
        }
        const decoder = watcherDecoders[section.watcher];

        if (!Object.prototype.hasOwnProperty.call(watcherRegistrationByName, section.watcher)) {
            throw new MatchLoadError(`State watcher "${section.watcher}" has no registration entry.`);
        }
        const register = watcherRegistrationByName[section.watcher];
        const watcher = register(library);

        const decodedEntries = (section as ISavedStateWatcherSection).entries.map((entry) => decoder(entry, context));
        watcher.setRawEntriesForStateInjection(decodedEntries);
    }
}
