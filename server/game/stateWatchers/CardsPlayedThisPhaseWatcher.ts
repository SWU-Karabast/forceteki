import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import type { CardType } from '../core/Constants';
import { StateWatcherName } from '../core/Constants';
import type { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import type { Player } from '../core/Player';
import type { Card } from '../core/card/Card';
import type { IInPlayCard } from '../core/card/baseClasses/InPlayCard';
import type { IPlayableCard } from '../core/card/baseClasses/PlayableOrDeployableCard';
import type { GameObjectBase, GameObjectRef } from '../core/GameObjectBase';

type GameObjectOrRef<T extends GameObjectBase> = T | GameObjectRef<T>;

interface IPlayedCardEntryBase {
    card: GameObjectOrRef<IPlayableCard>;
    playEvent: any;
    inPlayId?: number;
    playedBy: GameObjectOrRef<Player>;
    parentCard?: GameObjectOrRef<IInPlayCard>;
    parentCardInPlayId?: number;
    hasWhenDefeatedAbilities?: boolean;
    playedAsType: CardType;
}

interface IPlayedCardEntryInternal extends IPlayedCardEntryBase {
    card: GameObjectRef<IPlayableCard>;
    playedBy: GameObjectRef<Player>;
    parentCard?: GameObjectRef<IInPlayCard>;
}

export interface IPlayedCardEntryExternal extends IPlayedCardEntryBase {
    card: IPlayableCard;
    playedBy: Player;
    parentCard?: IInPlayCard;
}

export type ICardsPlayedThisPhase = IPlayedCardEntryExternal[];

export class CardsPlayedThisPhaseWatcher extends StateWatcher<IPlayedCardEntryInternal[], IPlayedCardEntryExternal[]> {
    public constructor(
        registrar: StateWatcherRegistrar,
        card: Card
    ) {
        super(StateWatcherName.CardsPlayedThisPhase, registrar, card);
    }

    /**
     * Returns an array of {@link IPlayedCardEntryExternal} objects representing every card played
     * in this phase so far and the player who played that card
     */
    public override getCurrentValue(): ICardsPlayedThisPhase {
        return super.getCurrentValue();
    }

    /** Filters the list of played cards in the state and returns the cards that match */
    public getCardsPlayed(filter: (entry: IPlayedCardEntryExternal) => boolean): Card[] {
        return this.getCurrentValue()
            .filter(filter)
            .map((entry) => entry.card);
    }

    /** Check the list of played cards in the state if we found cards that match filters */
    public someCardPlayed(filter: (entry: IPlayedCardEntryExternal) => boolean): boolean {
        return this.getCardsPlayed(filter).length > 0;
    }

    public override convertState(state: IPlayedCardEntryInternal[]): IPlayedCardEntryExternal[] {
        return state.map((entry) => {
            const { card, playedBy, parentCard, ...nonGameObjectProps } = entry;

            return {
                ...nonGameObjectProps,
                card: this.refToGameObject(card),
                playedBy: this.refToGameObject(playedBy),
                parentCard: this.refToGameObject(parentCard)
            };
        });
    }

    protected override setupWatcher() {
        // on card played, add the card to the player's list of cards played this phase
        this.addUpdater({
            when: {
                onCardPlayed: () => true,
            },
            update: (currentState: IPlayedCardEntryInternal[], event: any) =>
                currentState.concat({
                    card: event.card,
                    playEvent: event,
                    parentCard: event.card.isUpgrade() && event.card.isAttached() ? event.card.parentCard : null,
                    parentCardInPlayId: event.card.isUpgrade() && event.card.parentCard?.canBeInPlay() ? event.card.parentCard.inPlayId : null,
                    inPlayId: event.card.inPlayId ?? null,
                    playedBy: event.player,
                    hasWhenDefeatedAbilities: event.card.canBeInPlay() && event.card.getTriggeredAbilities().some((ability) => ability.isWhenDefeated),
                    playedAsType: event.card.type,
                })
        });
    }

    protected override getResetValue(): IPlayedCardEntryInternal[] {
        return [];
    }
}
