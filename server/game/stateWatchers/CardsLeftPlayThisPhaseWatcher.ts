import type { IInPlayCard } from '../core/card/baseClasses/InPlayCard';
import type { Card } from '../core/card/Card';
import type { CardType } from '../core/Constants';
import { StateWatcherName } from '../core/Constants';
import type { Player } from '../core/Player';
import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import type { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import * as EnumHelpers from '../core/utils/EnumHelpers';

export interface CardLeftPlayEntry {
    card: IInPlayCard;
    controlledBy: Player;
    cardType: CardType;
}

export type ICardsLeftPlayThisPhase = CardLeftPlayEntry[];

export class CardsLeftPlayThisPhaseWatcher extends StateWatcher<CardLeftPlayEntry[]> {
    public constructor(registrar: StateWatcherRegistrar, card: Card) {
        super(StateWatcherName.CardsLeftPlayThisPhase, registrar, card);
    }

    public override getCurrentValue() {
        return super.getCurrentValue();
    }

    public getCardsLeftPlay({ controller, filter }: {
        controller?: Player;
        filter?: (event: CardLeftPlayEntry) => boolean;
    }) {
        const playerFilter = (entry: CardLeftPlayEntry) => (controller != null ? entry.controlledBy === controller : true);

        if (filter != null) {
            return this.getCurrentValue().filter(filter)
                .filter(playerFilter)
                .map((entry) => entry.card);
        }

        return this.getCurrentValue().filter(playerFilter)
            .map((entry) => entry.card);
    }

    public someCardLeftPlay({ controller, filter }: {
        controller?: Player;
        filter?: (event: CardLeftPlayEntry) => boolean;
    }) {
        return this.getCardsLeftPlay({ controller, filter }).length > 0;
    }

    public someUnitLeftPlay({ controller, filter }: {
        controller?: Player;
        filter?: (event: CardLeftPlayEntry) => boolean;
    }) {
        const playerFilter = (entry: CardLeftPlayEntry) => (controller != null ? entry.controlledBy === controller : true);

        const unitsLeftPlay = this.getCurrentValue().filter((entry) => EnumHelpers.isUnit(entry.cardType));

        if (filter != null) {
            return unitsLeftPlay.filter(filter)
                .filter(playerFilter)
                .map((entry) => entry.card).length > 0;
        }

        return unitsLeftPlay.filter(playerFilter)
            .map((entry) => entry.card).length > 0;
    }

    protected override setupWatcher() {
        this.addUpdater({
            when: {
                onCardLeavesPlay: () => true
            },
            update: (currentState, event) => currentState.concat({ card: event.card, controlledBy: event.lastKnownInformation.controller, cardType: event.lastKnownInformation.type })
        });
    }

    protected override getResetValue() {
        return [];
    }
}
