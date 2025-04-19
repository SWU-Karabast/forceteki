import type { ExternalConverter } from '../core/stateWatcher/StateWatcher';
import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import type { CardType } from '../core/Constants';
import { StateWatcherName } from '../core/Constants';
import type { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import type { Player } from '../core/Player';
import type { Card } from '../core/card/Card';
import type { IInPlayCard } from '../core/card/baseClasses/InPlayCard';
import type { IPlayableCard } from '../core/card/baseClasses/PlayableOrDeployableCard';
import type { GameObjectRef } from '../core/GameObjectBase';

export interface PlayedCardEntry {
    card: GameObjectRef<IPlayableCard>;
    playEvent: any;
    inPlayId?: number;
    playedBy: GameObjectRef<Player>;
    parentCard?: GameObjectRef<IInPlayCard>;
    parentCardInPlayId?: number;
    hasWhenDefeatedAbilities?: boolean;
    playedAsType: CardType;
}

export type ICardsPlayedThisPhase = PlayedCardEntry[];

export class CardsPlayedThisPhaseWatcher extends StateWatcher<ICardsPlayedThisPhase> {
    public constructor(
        registrar: StateWatcherRegistrar,
        card: Card
    ) {
        super(StateWatcherName.CardsPlayedThisPhase, registrar, card);
    }

    /** Filters the list of played cards in the state and returns the cards that match */
    public getCardsPlayed(filter: (entry: ExternalConverter<PlayedCardEntry>) => boolean): Card[] {
        return this.getCurrentValue()
            .filter(filter)
            .map((entry) => entry.card);
    }

    /** Check the list of played cards in the state if we found cards that match filters */
    public someCardPlayed(filter: (entry: ExternalConverter<PlayedCardEntry>) => boolean): boolean {
        return this.getCardsPlayed(filter).length > 0;
    }

    protected override setupWatcher() {
        // on card played, add the card to the player's list of cards played this phase
        this.addUpdater({
            when: {
                onCardPlayed: () => true,
            },
            update: (currentState: ICardsPlayedThisPhase, event: any) =>
                currentState.concat({
                    card: event.card.getRef(),
                    playEvent: event,
                    parentCard: event.card.isUpgrade() && event.card.isAttached() ? event.card.parentCard.getRef() : null,
                    parentCardInPlayId: event.card.isUpgrade() && event.card.parentCard?.canBeInPlay() ? event.card.parentCard.inPlayId : null,
                    inPlayId: event.card.inPlayId ?? null,
                    playedBy: event.player.getRef(),
                    hasWhenDefeatedAbilities: event.card.canBeInPlay() && event.card.getTriggeredAbilities().some((ability) => ability.isWhenDefeated),
                    playedAsType: event.card.type,
                })
        });
    }

    protected override getResetValue(): ICardsPlayedThisPhase {
        return [];
    }
}
