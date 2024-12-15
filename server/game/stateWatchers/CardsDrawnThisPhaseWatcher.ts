import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import { StateWatcherName } from '../core/Constants';
import { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import Player from '../core/Player';
import { Card } from '../core/card/Card';
import { InPlayCard } from '../core/card/baseClasses/InPlayCard';
import * as Contract from '../core/utils/Contract';

export interface DrawnCardEntry {
    player: Player;
    card: InPlayCard;
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
        return this.getCurrentValue().filter((e) => e.player === drawnBy).length;
    }

    protected override setupWatcher() {
        // on cards drawn, add the card to the player's list of cards played this phase
        this.addUpdater({
            when: {
                onCardsDrawn: () => true,
            },
            update: (currentState: DrawnCardEntry[], event: any) => {
                Contract.assertTrue(event.cards != null || event.card != null);
                if (event.cards != null) {
                    if (event.cards.length > 0) {
                        for (const card of event.cards) {
                            currentState = currentState.concat({
                                player: event.player,
                                card: card,
                            });
                        }
                    }
                    return currentState;
                } else if (event.card != null) {
                    return currentState.concat({ player: event.player, card: event.card });
                }
                return currentState;
            }
        });
    }

    protected override getResetValue(): DrawnCardEntry[] {
        return [];
    }
}
