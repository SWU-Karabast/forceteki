import type { IInPlayCard } from '../core/card/baseClasses/InPlayCard';
import type { CardType, ZoneName } from '../core/Constants';
import { StateWatcherName } from '../core/Constants';
import type { Game } from '../core/Game';
import type { UnwrapRef } from '../core/GameObjectBase';
import type { Player } from '../core/Player';
import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import type { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import { EnumHelpers } from '../core/utils/EnumHelpers';

import { registerState, type GameObjectId } from '../core/GameObjectUtils';

export interface CardLeftPlayEntry {
    card: GameObjectId<IInPlayCard>;
    controlledBy: GameObjectId<Player>;
    cardType: CardType;

    /** The card's power when it left play */
    power?: number;

    /** Arena card was in when it left play */
    arena?: ZoneName;
}

@registerState()
export class CardsLeftPlayThisPhaseWatcher extends StateWatcher<CardLeftPlayEntry> {
    public constructor(game: Game, registrar: StateWatcherRegistrar) {
        super(game, StateWatcherName.CardsLeftPlayThisPhase, registrar);
    }

    protected override mapCurrentValue(stateValue: CardLeftPlayEntry[]): UnwrapRef<CardLeftPlayEntry[]> {
        return stateValue.map((x) => ({ controlledBy: this.game.getFromId(x.controlledBy), card: this.game.getFromId(x.card), cardType: x.cardType, power: x.power, arena: x.arena }));
    }

    public override getCurrentValue() {
        return super.getCurrentValue();
    }

    public getCardsLeftPlay({ controller, filter }: {
        controller?: Player;
        filter?: (event: UnwrapRef<CardLeftPlayEntry>) => boolean;
    }) {
        const playerFilter = (entry: UnwrapRef<CardLeftPlayEntry>) => (controller != null ? entry.controlledBy === controller : true);

        if (filter != null) {
            return this.getCurrentValue().filter(filter)
                .filter(playerFilter)
                .map((entry) => entry.card);
        }

        return this.getCurrentValue().filter(playerFilter)
            .map((entry) => entry.card);
    }

    public getMostRecentLeftPlayEntry(card: IInPlayCard): UnwrapRef<CardLeftPlayEntry> | undefined {
        const entries = this.getCurrentValue().filter((entry) => entry.card === card);
        return entries[entries.length - 1];
    }

    public someCardLeftPlay({ controller, filter }: {
        controller?: Player;
        filter?: (event: UnwrapRef<CardLeftPlayEntry>) => boolean;
    }) {
        return this.getCardsLeftPlay({ controller, filter }).length > 0;
    }

    public someUnitLeftPlay({ controller, filter }: {
        controller?: Player;
        filter?: (event: UnwrapRef<CardLeftPlayEntry>) => boolean;
    }) {
        const playerFilter = (entry: UnwrapRef<CardLeftPlayEntry>) => (controller != null ? entry.controlledBy === controller : true);

        const unitsLeftPlay = this.getCurrentValue().filter((entry) => EnumHelpers.isUnit(entry.cardType));

        if (filter != null) {
            return unitsLeftPlay.filter(filter)
                .filter(playerFilter)
                .map((entry) => entry.card).length > 0;
        }

        return unitsLeftPlay.filter(playerFilter)
            .map((entry) => entry.card).length > 0;
    }

    public someLeaderUnitLeftPlay({ controller, filter }: {
        controller?: Player;
        filter?: (event: UnwrapRef<CardLeftPlayEntry>) => boolean;
    }) {
        const leaderUnitFilter = (entry: UnwrapRef<CardLeftPlayEntry>) => EnumHelpers.isLeaderUnit(entry.cardType);

        return this.someUnitLeftPlay({
            controller,
            filter: filter != null
                ? (entry) => leaderUnitFilter(entry) && filter(entry)
                : leaderUnitFilter
        });
    }

    protected override setupWatcher() {
        this.addUpdater({
            when: {
                onCardLeavesPlay: () => true
            },
            update: (currentState, event) => currentState.concat({
                card: event.card.getObjectId(),
                controlledBy: event.lastKnownInformation.controller.getObjectId(),
                cardType: event.lastKnownInformation.type,
                power: event.lastKnownInformation.power,
                arena: event.lastKnownInformation.arena
            })
        });
    }

    protected override getResetValue() {
        return [];
    }
}
