import { Card } from '../core/card/Card';
import { InPlayCard } from '../core/card/CardTypes';
import { StateWatcherName } from '../core/Constants';
import Player from '../core/Player';
import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';

export interface CardLeftPlayEntry {
    card: InPlayCard;
    controlledBy: Player;
}

export type ICardsLeftPlayThisPhase = CardLeftPlayEntry[];

export class CardsLeftPlayThisPhaseWatcher extends StateWatcher<CardLeftPlayEntry[]> {
    public constructor(registrar: StateWatcherRegistrar, card: Card) {
        super(StateWatcherName.CardsLeftPlayThisPhase, registrar, card);
    }

    public override getCurrentValue() {
        return super.getCurrentValue();
    }

    public getCardsLeftPlayControlledByPlayer({ controller, filter }: {controller: Player, filter?: (event: CardLeftPlayEntry) => boolean }) {
        const playerFilter = (entry: CardLeftPlayEntry) => entry.controlledBy === controller;

        if (filter != null) {
            return this.getCurrentValue().filter(filter)
                .filter(playerFilter)
                .map((entry) => entry.card);
        }

        return this.getCurrentValue().filter(playerFilter)
            .map((entry) => entry.card);
    }

    protected override setupWatcher() {
        this.addUpdater({
            when: {
                onCardLeavesPlay: (context) => context.card.isUnit() || context.card.isUpgrade()
            },
            update: (currentState, event) => currentState.concat({ card: event.card, controlledBy: event.card.controller })
        });
    }

    protected override getResetValue() {
        return [];
    }
}
