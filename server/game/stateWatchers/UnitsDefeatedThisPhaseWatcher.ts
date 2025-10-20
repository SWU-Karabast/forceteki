import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import { StateWatcherName } from '../core/Constants';
import type { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import type { Player } from '../core/Player';
import type { IUnitCard } from '../core/card/propertyMixins/UnitProperties';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import type Game from '../core/Game';
import type { GameObjectRef, UnwrapRef, UnwrapRefObject } from '../core/GameObjectBase';
import type { IDefeatSource } from '../IDamageOrDefeatSource';

export interface DefeatedUnitEntry {
    unit: GameObjectRef<IUnitCard>;
    inPlayId: number;
    controlledBy: GameObjectRef<Player>;
    defeatedBy?: GameObjectRef<Player>;
    wasDefeatedWhileAttacking: IDefeatSource;
}

interface InPlayUnit {
    unit: IUnitCard;
    inPlayId: number;
}

export class UnitsDefeatedThisPhaseWatcher extends StateWatcher<DefeatedUnitEntry> {
    public constructor(
        game: Game,
        registrar: StateWatcherRegistrar) {
        super(game, StateWatcherName.UnitsDefeatedThisPhase, registrar);
    }

    protected override mapCurrentValue(stateValue: DefeatedUnitEntry[]): UnwrapRefObject<DefeatedUnitEntry>[] {
        return stateValue.map((x) => ({ inPlayId: x.inPlayId, unit: this.game.getFromRef(x.unit), controlledBy: this.game.getFromRef(x.controlledBy), defeatedBy: this.game.getFromRef(x.defeatedBy), wasDefeatedWhileAttacking: x.wasDefeatedWhileAttacking }));
    }

    /**
     * Returns an array of {@link DefeatedUnitEntry} objects representing every unit defeated
     * this phase so far, as well as the controlling and defeating player.
     */
    public override getCurrentValue() {
        return super.getCurrentValue();
    }

    /** Get the list of the specified player's units that were defeated */
    public getDefeatedUnitsControlledByPlayer(controller: Player): IUnitCard[] {
        return this.getCurrentValue()
            .filter((entry) => entry.controlledBy === controller)
            .map((entry) => entry.unit);
    }

    /** Get the list of the units that were defeated this phase */
    public someUnitDefeatedThisPhase(filter: (entry: UnwrapRef<DefeatedUnitEntry>) => boolean): boolean {
        return this.getCurrentValue().filter(filter).length > 0;
    }

    /** Get the list of the specified player's units that were defeated */
    public getDefeatedUnitsControlledByPlayerNew(controller: Player): InPlayUnit[] {
        return this.getCurrentValue()
            .filter((entry) => entry.controlledBy === controller)
            .map((entry) => ({ unit: entry.unit, inPlayId: entry.inPlayId }));
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

    protected override setupWatcher() {
        this.addUpdater({
            when: {
                onCardDefeated: (event) => EnumHelpers.isUnit(event.lastKnownInformation.type)
            },
            update: (currentState: DefeatedUnitEntry[], event: any) =>
                currentState.concat({ unit: event.card.getRef(), inPlayId: event.card.mostRecentInPlayId, controlledBy: event.lastKnownInformation.controller.getRef(), defeatedBy: event.defeatSource.player?.getRef(), wasDefeatedWhileAttacking: event.isDefeatedWhileAttacking })
        });
    }

    protected override getResetValue(): DefeatedUnitEntry[] {
        return [];
    }
}
