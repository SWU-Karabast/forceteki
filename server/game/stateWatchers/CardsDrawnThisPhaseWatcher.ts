import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import { StateWatcherName } from '../core/Constants';
import { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import Player from '../core/Player';
import { Card } from '../core/card/Card';

export interface DrawnCardEntry {
    player: Player;
    amount: number;
}

export class CardsDrawnThisPhaseWatcher extends StateWatcher<DrawnCardEntry[]> {
    public constructor(
        registrar: StateWatcherRegistrar,
        card: Card
    ) {
        super(StateWatcherName.CardsDrawnThisPhase, registrar, card);
    }

    /**
     * Returns an array of {@link DrawnCardEntry} objects representing every card drawn in this phase so far and the player who drew that card
     */
    public override getCurrentValue(): DrawnCardEntry[] {
        return super.getCurrentValue();
    }

    /** Get the amount of cards drawn by a player this phase */
    public drawnCardsAmount(drawnBy: Player): number {
        return this.getCurrentValue().find((e) => e.player === drawnBy)?.amount || 0;
    }

    protected override setupWatcher() {
        // on cards drawn, add the card to the player's list of cards played this phase
        this.addUpdater({
            when: {
                onCardsDrawn: () => true,
            },
            update: (currentState: DrawnCardEntry[], event: any) => {
                const entry = currentState.find((entry) => entry.player === event.player);
                if (entry != null) {
                    entry.amount += event.amount;
                    return currentState;
                }
                return currentState.concat({ player: event.player, amount: event.amount });
            }
        });
    }

    protected override getResetValue(): DrawnCardEntry[] {
        return [];
    }
}
