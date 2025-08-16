import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import { StateWatcherName } from '../core/Constants';
import type { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import type { Player } from '../core/Player';
import type { Card } from '../core/card/Card';
import * as Contract from '../core/utils/Contract';
import type Game from '../core/Game';
import type { GameObjectRef, UnwrapRef } from '../core/GameObjectBase';

export interface DrawnCardEntry {
    player: GameObjectRef<Player>;
    card: GameObjectRef<Card>;
}

export class CardsDrawnThisPhaseWatcher extends StateWatcher<DrawnCardEntry> {
    public constructor(
        game: Game,
        registrar: StateWatcherRegistrar) {
        super(game, StateWatcherName.CardsDrawnThisPhase, registrar);
    }

    protected override mapCurrentValue(stateValue: DrawnCardEntry[]): UnwrapRef<DrawnCardEntry[]> {
        return stateValue.map((x) => ({ player: this.game.getFromRef(x.player), card: this.game.getFromRef(x.card) }));
    }

    /**
     * Returns an array of {@link DrawnCardEntry} objects representing every card drawn in this phase so far and the player who drew that card
     */
    public override getCurrentValue() {
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
                if (event.cards != null && event.cards.length > 0) {
                    for (const card of event.cards) {
                        currentState = currentState.concat({
                            player: event.player.getRef(),
                            card: card.getRef(),
                        });
                    }
                    return currentState;
                }
                if (event.card != null) {
                    return currentState.concat({ player: event.player.getRef(), card: event.card.getRef() });
                }
                return currentState;
            }
        });
    }

    protected override getResetValue(): DrawnCardEntry[] {
        return [];
    }
}
