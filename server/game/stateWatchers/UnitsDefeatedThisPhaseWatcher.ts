import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import { StateWatcherName } from '../core/Constants';
import { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import Player from '../core/Player';
import { UnitCard } from '../core/card/CardTypes';
import { Card } from '../core/card/Card';

export interface DefeatedUnitEntry {
    unit: UnitCard;
    controlledBy: Player;
    defeatedBy: Player;
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

    /** Get the list of units that were defeated */
    public getDefeatedUnits(controller: Player = null, defeater: Player = null): UnitCard[] {
        let entries = this.getCurrentValue();

        if (controller) {
            entries = entries.filter((entry) => entry.controlledBy === controller);
        }

        if (defeater) {
            entries = entries.filter((entry) => entry.defeatedBy === defeater);
        }

        return entries.map((entry) => entry.unit);
    }

    protected override setupWatcher() {
        // on card played, add the card to the player's list of cards played this phase
        this.addUpdater({
            when: {
                onCardDefeated: (context) => context.card.isUnit(),
            },
            update: (currentState: IUnitsDefeatedThisPhase, event: any) => currentState.concat({ unit: event.card, controlledBy: event.card.controller, defeatedBy: event.defeatSource === 'ability' ? event.context.player : event.defeatSource.player })
        });
    }

    protected override getResetValue(): IUnitsDefeatedThisPhase {
        return [];
    }
}
