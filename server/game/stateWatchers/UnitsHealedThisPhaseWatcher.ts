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

    /** Check if a specific copy of a unit was healed this phase */
    public wasHealedThisPhase(card: IUnitCard, inPlayId?: number): boolean {
        const inPlayIdToCheck = inPlayId ?? (card.isInPlay() ? card.inPlayId : card.mostRecentInPlayId);

        return this.getCurrentValue().some(
            (entry) => entry.unit === card && entry.inPlayId === inPlayIdToCheck
        );
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
