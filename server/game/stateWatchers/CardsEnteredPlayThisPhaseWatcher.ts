import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import { StateWatcherName } from '../core/Constants';
import type { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import type { Player } from '../core/Player';
import type { Card } from '../core/card/Card';
import type { IInPlayCard } from '../core/card/baseClasses/InPlayCard';
import type Game from '../core/Game';
import type { GameObjectRef, UnwrapRef } from '../core/GameObjectBase';

export interface EnteredCardEntry {
    card: GameObjectRef<IInPlayCard>;
    playedBy: GameObjectRef<Player>;
}

// there is a known issue where CardsEnteredPlayThisPhaseWatcher currently doesn't work with leaders
export class CardsEnteredPlayThisPhaseWatcher extends StateWatcher<EnteredCardEntry> {
    public constructor(
        game: Game,
        registrar: StateWatcherRegistrar,
        card: Card
    ) {
        super(game, StateWatcherName.CardsEnteredPlayThisPhase, registrar);
    }

    protected override mapCurrentValue(stateValue: EnteredCardEntry[]): UnwrapRef<EnteredCardEntry[]> {
        return stateValue.map((x) => ({ playedBy: this.game.getFromRef(x.playedBy), card: this.game.getFromRef(x.card) }));
    }

    /**
     * Returns an array of {@link EnteredCardEntry} objects representing every card entering play
     * in this phase so far and the player who played that card
     */
    public override getCurrentValue() {
        return super.getCurrentValue();
    }

    /** Filters the list of entered play cards in the state and returns the cards that match */
    public getCardsEnteredPlay(filter: (entry: UnwrapRef<EnteredCardEntry>) => boolean): Card[] {
        return this.getCurrentValue()
            .filter(filter)
            .map((entry) => entry.card);
    }

    /** Checks the state for cards that entered play and match the provided filter */
    public someCardEnteredPlay(filter: (entry: UnwrapRef<EnteredCardEntry>) => boolean): boolean {
        return this.getCardsEnteredPlay(filter).length > 0;
    }

    protected override setupWatcher() {
        // on card entered play, add the card to the player's list of cards entered play this phase
        this.addUpdater({
            when: {
                onUnitEntersPlay: () => true,
            },
            update: (currentState: EnteredCardEntry[], event: any) =>
                currentState.concat({ card: event.card.getRef(), playedBy: event.card.controller.getRef() })
        });
    }

    protected override getResetValue(): EnteredCardEntry[] {
        return [];
    }
}
