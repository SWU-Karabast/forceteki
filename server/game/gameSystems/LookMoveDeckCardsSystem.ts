import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import type { GameEvent } from '../core/event/GameEvent';
import type { MoveZoneDestination } from '../core/Constants';
import { GameStateChangeRequired, ZoneName } from '../core/Constants';
import { EventName, DeckZoneDestination } from '../core/Constants';
import { MoveCardSystem } from './MoveCardSystem';
import * as Contract from '../core/utils/Contract';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import type Player from '../core/Player';
import { DiscardFromDeckSystem } from './DiscardFromDeckSystem';

export interface ILookMoveDeckCardsProperties extends IPlayerTargetSystemProperties {
    amount: number;
    destinations: MoveZoneDestination[];
    promptTitle: string;
}

export class LookMoveDeckCardsSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, ILookMoveDeckCardsProperties> {
    public override readonly name = 'lookMoveDeckCardsSystem';
    protected override readonly eventName = EventName.OnLookMoveDeckCards;
    public override readonly effectDescription = 'look at the top cards of your deck and move them';

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override eventHandler(event): void { }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext): void {
        const player = context.player;
        const { amount, destinations, promptTitle } = this.generatePropertiesFromContext(context);
        const deckLength = player.drawDeck.length;

        if (deckLength === 0) {
            return;
        }

        if (Array.isArray(destinations)) {
            if (destinations.length === 0) {
                throw new Error('destinations must have at least one element');
            }
        }

        const perCardButtons = destinations.map((destination) => {
            switch (destination) {
                case DeckZoneDestination.DeckTop:
                    return { text: 'Put on top', arg: 'top' };
                case DeckZoneDestination.DeckBottom:
                    return { text: 'Put on bottom', arg: 'bottom' };
                case ZoneName.Discard:
                    return { text: 'Discard', arg: 'discard' };
                default:
                    throw new Error(`LookMoveDeck unsupported destination: ${destination}`);
            }
        });

        const actualAmount = Math.min(amount, deckLength);
        const cards = player.drawDeck.slice(0, actualAmount);

        context.game.promptDisplayCardsWithButtons(player, {
            activePromptTitle: promptTitle,
            source: context.source,
            displayCards: cards,
            perCardButtons: perCardButtons,
            onCardButton: (card: Card, arg: string) => {
                this.pushMoveEvent(arg, card, events, context);
                return true;
            }
        });
    }

    public override defaultTargets(context: TContext): Player[] {
        return [context.player];
    }

    public override canAffect(target: Player | Player[], context: TContext, additionalProperties?: any, mustChangeGameState?: GameStateChangeRequired): boolean {
        let nonAraTarget: Player;

        if (Array.isArray(target)) {
            if (target.length > 1) {
                throw new Error('Support for multiple players in LookMoveDeckCardsSystem not implemented yet');
            }

            Contract.assertTrue(target.length === 1);

            nonAraTarget = target[0];
        } else {
            nonAraTarget = target;
        }

        if (mustChangeGameState !== GameStateChangeRequired.None && nonAraTarget.drawDeck.length === 0) {
            return false;
        }

        return super.canAffect(target, context, additionalProperties, mustChangeGameState);
    }

    // Helper method for pushing the move card event into the events array.
    private pushMoveEvent(
        arg: string,
        card: Card,
        events: GameEvent[],
        context: TContext
    ) {
        let moveEvent: GameEvent;
        if (arg === 'discard') {
            moveEvent = new DiscardFromDeckSystem({
                amount: 1
            }).generateEvent(context);
        } else {
            moveEvent = new MoveCardSystem({
                destination: arg === 'bottom' ? DeckZoneDestination.DeckBottom : DeckZoneDestination.DeckTop,
                target: card
            }).generateEvent(context);
        }
        events.push(moveEvent);
    }
}