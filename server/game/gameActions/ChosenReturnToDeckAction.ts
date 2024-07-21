import type { AbilityContext } from '../AbilityContext';
import { EventNames, Locations, Players, TargetModes } from '../Constants';
import type Player from '../player';
import { PlayerAction, type PlayerActionProperties } from './PlayerAction';

export interface ChosenReturnToDeckProperties extends PlayerActionProperties {
    amount?: number;
    targets?: boolean;
    shuffle?: boolean;
    bottom?: boolean;
}

export class ChosenReturnToDeckAction extends PlayerAction<ChosenReturnToDeckProperties> {
    defaultProperties: ChosenReturnToDeckProperties = {
        amount: 1,
        targets: true,
        shuffle: false,
        bottom: false
    };
    name = 'returnToDeck';
    eventName = EventNames.OnCardMoved;

    getEffectMessage(context: AbilityContext): [string, any[]] {
        let properties = this.getProperties(context);
        return ['make {0} return {1} cards to their deck', [properties.target, properties.amount]];
    }

    canAffect(player: Player, context: AbilityContext, additionalProperties = {}): boolean {
        let properties = this.getProperties(context, additionalProperties);
        if (player.hand.size() === 0 || properties.amount === 0) {
            return false;
        }
        return super.canAffect(player, context);
    }

    addEventsToArray(events: any[], context: AbilityContext, additionalProperties = {}): void {
        let properties = this.getProperties(context, additionalProperties);
        for (let player of properties.target as Player[]) {
            let amount = Math.min(player.hand.size(), properties.amount);
            if (amount > 0) {
                if (amount === player.hand.size()) {
                    let event = this.getEvent(player, context) as any;
                    event.cards = player.hand.slice(0, amount);
                    events.push(event);
                    return;
                }

                if (properties.targets && context.choosingPlayerOverride && context.choosingPlayerOverride !== player) {
                    let event = this.getEvent(player, context) as any;
                    event.cards = player.hand.shuffle().slice(0, amount);
                    events.push(event);
                    return;
                }
                context.game.promptForSelect(player, {
                    activePromptTitle:
                        'Choose ' + (amount === 1 ? 'a card' : amount + ' cards') + ' to return to your deck',
                    context: context,
                    mode: TargetModes.Exactly,
                    numCards: amount,
                    location: Locations.Hand,
                    controller: player === context.player ? Players.Self : Players.Opponent,
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
        let { amount, shuffle, bottom } = this.getProperties(context, additionalProperties);
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.options = { bottom };
        event.amount = amount;
        event.cards = [];
        event.shuffle = shuffle;
        event.bottom = bottom;
    }

    eventHandler(event): void {
        event.context.game.addMessage(
            '{0} returns {1} card{2} to{3} their deck',
            event.player,
            event.cards.length,
            event.cards.length === 1 ? '' : 's',
            event.bottom ? ' the bottom of' : ''
        );
        event.discardedCards = event.cards;
        let player = [];
        for (let card of event.cards) {
            card.owner.moveCard(card, Locations.ConflictDeck, event.options);
            if (!player.includes(card.owner)) {
                player.push(card.owner);
            }
        }
        if (event.shuffle) {
            player.forEach((p) => p.shuffleConflictDeck());
        }
    }
}