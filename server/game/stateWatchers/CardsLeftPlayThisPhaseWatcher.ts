import { Card } from '../core/card/Card';
import { UnitCard } from '../core/card/CardTypes';
import { UpgradeCard } from '../core/card/UpgradeCard';
import { StateWatcherName } from '../core/Constants';
import Player from '../core/Player';
import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';

export interface CardLeftPlayEntry {
    card: UnitCard | UpgradeCard;
    controlledBy: Player;
}

export type ICardsLeftPlayThisPhase = CardLeftPlayEntry[]

export class CardsLeftPlayThisPhaseWatcher extends StateWatcher<CardLeftPlayEntry[]> {
    public constructor(registrar: StateWatcherRegistrar, card: Card) {
        super(StateWatcherName.CardsLeftPlayThisPhase, registrar, card);
    }

    public override getCurrentValue() {
        return super.getCurrentValue();
    }

    public getCardsLeftPlayControlledByPlayer(controller: Player): (UnitCard | UpgradeCard)[] {
        return this.getCurrentValue().filter((entry) => entry.controlledBy === controller)
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
