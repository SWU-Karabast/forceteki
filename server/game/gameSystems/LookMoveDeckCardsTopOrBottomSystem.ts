import type { AbilityContext } from '../core/ability/AbilityContext';
import { DeckZoneDestination } from '../core/Constants';
import type { GameEvent } from '../core/event/GameEvent';
import { LookAtSystem } from './LookAtSystem';
import { LookMoveDeckCardsSystem } from './LookMoveDeckCardsSystem';

export interface ILookMoveDeckCardsTopOrBottomProperties {
    amount: number;
}

export class LookMoveDeckCardsTopOrBottomSystem<TContext extends AbilityContext = AbilityContext> extends LookMoveDeckCardsSystem<TContext> {
    public constructor(propertiesOrPropertyFactory: ILookMoveDeckCardsTopOrBottomProperties) {
        const destinations = [DeckZoneDestination.DeckTop, DeckZoneDestination.DeckBottom];
        const promptTitle = 'Select card to move to the top or bottom of the deck';
        super({ amount: propertiesOrPropertyFactory.amount, destinations: destinations, promptTitle: promptTitle });
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext): void {
        const player = context.player;
        const deckLength = player.drawDeck.length;

        if (deckLength === 1) {
            const lookAtEvent = new LookAtSystem({
                target: player.drawDeck[0]
            }).generateEvent(context);
            events.push(lookAtEvent);
        } else {
            super.queueGenerateEventGameSteps(events, context);
        }
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        const message =
            properties.amount > 0
                ? `look at the top ${properties.amount === 1 ? 'card' : `${properties.amount} cards`} of your deck. 
                ${properties.amount === 1 ? 'You may put it on the bottom of your deck'
                    : 'Put any number of them on the bottom of your deck and the rest on top in any order'}` : '';
        return [message, []];
    }
}