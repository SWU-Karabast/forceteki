import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import { StateWatcherName } from '../core/Constants';
import type { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import type Player from '../core/Player';
import type { UnitCard } from '../core/card/CardTypes';
import type { Card } from '../core/card/Card';

// TODO: add a "defeatedBy: Player" field here.
export interface DefeatedUnitEntry {
    unit: UnitCard;
    inPlayId: number;
    controlledBy: Player;
}

interface InPlayUnit {
    unit: UnitCard;
    inPlayId: number;
}

export type IUnitsDefeatedThisPhase = DefeatedUnitEntry[];

export class UnitsDefeatedThisPhaseWatcher extends StateWatcher<DefeatedUnitEntry[]> {
    public constructor(
        registrar: StateWatcherRegistrar,
        card: Card
    ) {
        super(StateWatcherName.UnitsDefeatedThisPhase, registrar, card);
    }

    /**
     * Returns an array of {@link DefeatedUnitEntry} objects representing every unit defeated
     * this phase so far, as well as the controlling and defeating player.
     */
    public override getCurrentValue(): IUnitsDefeatedThisPhase {
        return super.getCurrentValue();
    }

    /** Get the list of the specified player's units that were defeated */
    public getDefeatedUnitsControlledByPlayer(controller: Player): UnitCard[] {
        return this.getCurrentValue()
            .filter((entry) => entry.controlledBy === controller)
            .map((entry) => entry.unit);
    }

    /** Get the list of the specified player's units that were defeated */
    public getDefeatedUnitsControlledByPlayerNew(controller: Player): InPlayUnit[] {
        return this.getCurrentValue()
            .filter((entry) => entry.controlledBy === controller)
            .map((entry) => ({ unit: entry.unit, inPlayId: entry.inPlayId }));
    }

    /** Check if a specific copy of a unit was defeated this phase */
    public wasDefeatedThisPhase(card: UnitCard, inPlayId?: number): boolean {
        const inPlayIdToCheck = inPlayId ?? (card.isInPlay() ? card.inPlayId : card.mostRecentInPlayId);

        return this.getCurrentValue().some(
            (entry) => entry.unit === card && entry.inPlayId === inPlayIdToCheck
        );
    }

    /** Check if there is some units controlled by player that was defeated this phase */
    public someDefeatedUnitControlledByPlayer(controller: Player): boolean {
        return this.getCurrentValue().filter((entry) => entry.controlledBy === controller).length > 0;
    }

    protected override setupWatcher() {
        // on card played, add the card to the player's list of cards played this phase
        this.addUpdater({
            when: {
                onCardDefeated: (context) => context.card.isUnit(),
            },
            update: (currentState: IUnitsDefeatedThisPhase, event: any) =>
                currentState.concat({ unit: event.card, inPlayId: event.card.mostRecentInPlayId, controlledBy: event.card.controller })
        });
    }

    protected override getResetValue(): IUnitsDefeatedThisPhase {
        return [];
    }
}
