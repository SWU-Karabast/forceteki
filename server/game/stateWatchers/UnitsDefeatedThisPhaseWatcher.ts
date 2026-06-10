import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import type { CardType, Trait } from '../core/Constants';
import { StateWatcherName } from '../core/Constants';
import type { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import type { Player } from '../core/Player';
import type { IInPlayCard } from '../core/card/baseClasses/InPlayCard';
import type { IUnitCard } from '../core/card/propertyMixins/UnitProperties';
import { EnumHelpers } from '../core/utils/EnumHelpers';
import type { Game } from '../core/Game';
import type { UnwrapRef, UnwrapRefObject } from '../core/GameObjectBase';
import type { IDefeatSource } from '../IDamageOrDefeatSource';
import { registerState, type GameObjectId } from '../core/GameObjectUtils';


/**
 * Simplified last known information for defeated units
 */
export interface IDefeatedUnitLKIEntry {
    traits: Set<Trait>;
    type: CardType;
    // TODO: Add more fields if needed
}

export interface DefeatedUnitEntry {
    unit: GameObjectId<IInPlayCard>;
    inPlayId: number;
    controlledBy: GameObjectId<Player>;
    defeatedBy?: GameObjectId<Player>;
    wasDefeatedWhileAttacking: IDefeatSource;
    lastKnownInformation: IDefeatedUnitLKIEntry;
}

interface InPlayUnit {
    unit: IUnitCard;
    inPlayId: number;
}

/**
 * Tracks both units and upgrades defeated this phase. Helpers ending in `Unit*` filter
 * to unit defeats; helpers ending in `Upgrade*` filter to upgrade defeats; the public
 * {@link getCurrentValue} continues to return only unit defeats so existing callers
 * (which assumed unit-only data) are unaffected.
 *
 * TODO: pure-rename follow-up — rename this watcher (file, class, interface, enum value,
 * library method, fields) from `UnitsDefeated*` to `CardsDefeated*` to reflect its broadened
 * scope. Kept out of this PR to limit blast radius (~47 files).
 */
@registerState()
export class UnitsDefeatedThisPhaseWatcher extends StateWatcher<DefeatedUnitEntry> {
    public constructor(
        game: Game,
        registrar: StateWatcherRegistrar) {
        super(game, StateWatcherName.UnitsDefeatedThisPhase, registrar);
    }

    protected override mapCurrentValue(stateValue: DefeatedUnitEntry[]): UnwrapRefObject<DefeatedUnitEntry>[] {
        return stateValue.map((x) => ({
            inPlayId: x.inPlayId,
            unit: this.game.getFromId(x.unit),
            controlledBy: this.game.getFromId(x.controlledBy),
            defeatedBy: this.game.getFromId(x.defeatedBy),
            wasDefeatedWhileAttacking: x.wasDefeatedWhileAttacking,
            lastKnownInformation: {
                traits: x.lastKnownInformation.traits,
                type: x.lastKnownInformation.type,
            }
        }));
    }

    /**
     * Returns an array of {@link DefeatedUnitEntry} objects representing every unit defeated
     * this phase so far, as well as the controlling and defeating player.
     */
    public override getCurrentValue() {
        return super.getCurrentValue().filter((entry) => EnumHelpers.isUnit(entry.lastKnownInformation.type));
    }

    /** Get the list of the units that were defeated this phase */
    public someUnitDefeatedThisPhase(filter: (entry: UnwrapRef<DefeatedUnitEntry>) => boolean): boolean {
        return this.getCurrentValue().filter(filter).length > 0;
    }

    /** Get the list of the specified player's units that were defeated */
    public getDefeatedUnitsControlledByPlayer(controller: Player): InPlayUnit[] {
        return this.getCurrentValue()
            .filter((entry) => entry.controlledBy === controller)
            .map((entry) => ({ unit: entry.unit as IUnitCard, inPlayId: entry.inPlayId }));
    }

    /** Check if a specific copy of a unit was defeated this phase */
    public wasDefeatedThisPhase(card: IUnitCard, inPlayId?: number): boolean {
        const inPlayIdToCheck = inPlayId ?? (card.isInPlay() ? card.inPlayId : card.mostRecentInPlayId);

        return this.getCurrentValue().some(
            (entry) => entry.unit === card && entry.inPlayId === inPlayIdToCheck
        );
    }

    /** Check if there is some units controlled by player that was defeated this phase */
    public someDefeatedUnitControlledByPlayer(controller: Player): boolean {
        return this.getCurrentValue().filter((entry) => entry.controlledBy === controller).length > 0;
    }

    /** Check if there is some units controlled by player that was defeated this phase */
    public someDefeatedWhileAttackingUnitControlledByPlayer(controller: Player): boolean {
        return this.getCurrentValue().filter((entry) => entry.controlledBy === controller && entry.wasDefeatedWhileAttacking).length > 0;
    }

    /** Check if the given player defeated an enemy unit */
    public playerDefeatedEnemyUnit(player: Player): boolean {
        return this.getCurrentValue().filter((entry) => entry.controlledBy !== player && entry.defeatedBy === player).length > 0;
    }

    /** Check if some upgrade matching the given criteria was defeated this phase */
    public someUpgradeDefeatedThisPhase({ controller, filter }: {
        controller?: Player;
        filter?: (entry: UnwrapRef<DefeatedUnitEntry>) => boolean;
    } = {}): boolean {
        return super.getCurrentValue()
            .filter((entry) => EnumHelpers.isUpgrade(entry.lastKnownInformation.type))
            .filter((entry) => controller == null || entry.controlledBy === controller)
            .filter((entry) => filter == null || filter(entry))
            .length > 0;
    }

    protected override setupWatcher() {
        this.addUpdater({
            when: {
                onCardDefeated: (event) =>
                    EnumHelpers.isUnit(event.lastKnownInformation.type) ||
                    EnumHelpers.isUpgrade(event.lastKnownInformation.type)
            },
            update: (currentState: DefeatedUnitEntry[], event: any) =>
                currentState.concat({
                    unit: event.card.getObjectId(),
                    inPlayId: event.card.mostRecentInPlayId,
                    controlledBy: event.lastKnownInformation.controller.getObjectId(),
                    defeatedBy: event.defeatSource.player?.getObjectId(),
                    wasDefeatedWhileAttacking: event.isDefeatedWhileAttacking,
                    lastKnownInformation: {
                        traits: event.lastKnownInformation.traits,
                        type: event.lastKnownInformation.type,
                    }
                })
        });
    }

    protected override getResetValue(): DefeatedUnitEntry[] {
        return [];
    }
}
