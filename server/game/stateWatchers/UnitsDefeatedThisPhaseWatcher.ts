import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import { StateWatcherName } from '../core/Constants';
import { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import Player from '../core/Player';
import { UnitCard } from '../core/card/CardTypes';
import { Card } from '../core/card/Card';

export interface DefeatedUnitEntry {
    unit: UnitCard,
    controlledBy: Player,
    defeatedBy: Player
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

    /** Get the list of units defeated by the specified player */
    public getUnitsDefeatedByPlayer(defeatedBy: Player): UnitCard[] {
        return this.getCurrentValue()
            .filter((entry) => entry.defeatedBy === defeatedBy)
            .map((entry) => entry.unit);
    }

    /** Get the list of the specified player's units that were defeated */
    public getDefeatedUnitsControlledByPlayer(controller: Player): UnitCard[] {
        return this.getCurrentValue()
            .filter((entry) => entry.controlledBy === controller)
            .map((entry) => entry.unit);
    }

    protected override setupWatcher() {
        // on card played, add the card to the player's list of cards played this phase
        this.addUpdater({
            when: {
                onCardDefeated: (context) => context.card.isUnit(),
            },
            update: (currentState: IUnitsDefeatedThisPhase, event: any) =>
                currentState.concat({ unit: event.card, controlledBy: event.card.controller, defeatedBy: event.source.controller })
        });
    }

    protected override getResetValue(): IUnitsDefeatedThisPhase {
        return [];
    }
}
