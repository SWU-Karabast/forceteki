import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import { StateWatcherName } from '../core/Constants';
import type { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import type Player from '../core/Player';
import type { Card } from '../core/card/Card';
import type { IUnitCard } from '../core/card/propertyMixins/UnitProperties';

export interface HealedUnitEntry {
    unit: IUnitCard;
    inPlayId: number;
    controlledBy: Player;
}

interface InPlayUnit {
    unit: IUnitCard;
    inPlayId: number;
}

export type IUnitsHealedThisPhase = HealedUnitEntry[];

export class UnitsHealedThisPhaseWatcher extends StateWatcher<HealedUnitEntry[]> {
    public constructor(
        registrar: StateWatcherRegistrar,
        card: Card
    ) {
        super(StateWatcherName.UnitsHealedThisPhase, registrar, card);
    }

    /**
     * Returns an array of {@link HealedUnitEntry} objects representing every unit defeated
     * this phase so far, as well as the controlling and defeating player.
     */
    public override getCurrentValue(): IUnitsHealedThisPhase {
        return super.getCurrentValue();
    }

    /** Get the list of the specified player's units that were healed */
    public getHealedUnitsControlledByPlayer(controller: Player): IUnitCard[] {
        return this.getCurrentValue()
            .filter((entry) => entry.controlledBy === controller)
            .map((entry) => entry.unit);
    }

    /** Get the list of the units that were healed this phase */
    public someUnitHealedThisPhase(filter: (entry: HealedUnitEntry) => boolean): boolean {
        return this.getCurrentValue().filter(filter).length > 0;
    }

    /** Get the list of the specified player's units that were healed */
    public getHealedUnitsControlledByPlayerNew(controller: Player): InPlayUnit[] {
        return this.getCurrentValue()
            .filter((entry) => entry.controlledBy === controller)
            .map((entry) => ({ unit: entry.unit, inPlayId: entry.inPlayId }));
    }

    /** Check if a specific copy of a unit was healed this phase */
    public wasHealedThisPhase(card: IUnitCard, inPlayId?: number): boolean {
        const inPlayIdToCheck = inPlayId ?? (card.isInPlay() ? card.inPlayId : card.mostRecentInPlayId);

        return this.getCurrentValue().some(
            (entry) => entry.unit === card && entry.inPlayId === inPlayIdToCheck
        );
    }

    /** Check if there is some units controlled by player that was healed this phase */
    public someHealedUnitControlledByPlayer(controller: Player): boolean {
        return this.getCurrentValue().filter((entry) => entry.controlledBy === controller).length > 0;
    }

    protected override setupWatcher() {
        // on damage healed, add the card to the player's list of cards healed this phase
        this.addUpdater({
            when: {
                onDamageHealed: (context) => context.card.isUnit(),
            },
            update: (currentState: IUnitsHealedThisPhase, event: any) =>
                currentState.concat({ unit: event.card, inPlayId: event.card.inPlayId, controlledBy: event.card.controller })
        });
    }

    protected override getResetValue(): IUnitsHealedThisPhase {
        return [];
    }
}
