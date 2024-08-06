import type { AbilityContext } from '../AbilityContext';
import type BaseCard from '../basecard';
import { EventNames, Locations, Players, TargetModes } from '../Constants';
import type Player from '../player';
import { PlayerAction, type PlayerActionProperties } from './PlayerAction';

export interface ChosenDiscardProperties extends PlayerActionProperties {
    amount?: number;
    targets?: boolean;
    cardCondition?: (card: BaseCard, context: AbilityContext) => boolean;
}

export class ChosenDiscardAction extends PlayerAction<ChosenDiscardProperties> {
    defaultProperties: ChosenDiscardProperties = {
        amount: 1,
        targets: true,
        cardCondition: () => true
    };
    name = 'discard';
    eventName = EventNames.OnCardsDiscardedFromHand;

    getEffectMessage(context: AbilityContext): [string, any[]] {
        let properties = this.getProperties(context);
        return ['make {0} discard {1} cards', [properties.target, properties.amount]];
    }

    canAffect(player: Player, context: AbilityContext, additionalProperties = {}): boolean {
        let properties = this.getProperties(context, additionalProperties);
        const availableHand = player.hand.filter((card) => properties.cardCondition(card, context));

        if (availableHand.length === 0 || properties.amount === 0) {
            return false;
        }
        return super.canAffect(player, context);
    }

    addEventsToArray(events: any[], context: AbilityContext, additionalProperties = {}): void {
        let properties = this.getProperties(context, additionalProperties);
        for (let player of properties.target as Player[]) {
            const availableHand = player.hand.filter((card) => properties.cardCondition(card, context));
            let amount = Math.min(availableHand.length, properties.amount);
            if (amount > 0) {
                if (amount >= availableHand.length) {
                    let event = this.getEvent(player, context) as any;
                    event.cards = availableHand;
                    events.push(event);
                    return;
                }

                if (properties.targets && context.choosingPlayerOverride && context.choosingPlayerOverride !== player) {
                    let event = this.getEvent(player, context) as any;
                    event.cards = availableHand.slice(0, amount);
                    events.push(event);
                    return;
                }
                context.game.promptForSelect(player, {
                    activePromptTitle: 'Choose ' + (amount === 1 ? 'a card' : amount + ' cards') + ' to discard',
                    context: context,
                    mode: TargetModes.Exactly,
                    numCards: amount,
                    location: Locations.Hand,
                    controller: player === context.player ? Players.Self : Players.Opponent,
                    cardCondition: (card) => properties.cardCondition(card, context),
                    onSelect: (player, cards) => {
                        let event = this.getEvent(player, context) as any;
                        event.cards = cards;
                        events.push(event);
                        return true;
                    }
                });
            }
        }
    }

    addPropertiesToEvent(event, player: Player, context: AbilityContext, additionalProperties): void {
        let { amount } = this.getProperties(context, additionalProperties);
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.amount = amount;
        event.cards = [];
        event.discardedAtRandom = false;
    }

    eventHandler(event): void {
        event.context.game.addMessage('{0} discards {1}', event.player, event.cards);
        event.discardedCards = event.cards;
        for (let card of event.cards) {
            event.player.moveCard(card, card.isDynasty ? Locations.DynastyDiscardPile : Locations.ConflictDiscardPile);
        }
    }
}