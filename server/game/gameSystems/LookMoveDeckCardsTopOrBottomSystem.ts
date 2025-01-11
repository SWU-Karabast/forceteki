import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import type { GameEvent } from '../core/event/GameEvent';
import { GameStateChangeRequired } from '../core/Constants';
import { EventName, DeckZoneDestination } from '../core/Constants';
import { LookAtSystem } from './LookAtSystem';
import { MoveCardSystem } from './MoveCardSystem';
import * as Contract from '../core/utils/Contract';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import type Player from '../core/Player';

export interface ILookMoveDeckCardsTopOrBottomProperties extends IPlayerTargetSystemProperties {
    amount: number;
}

export class LookMoveDeckCardsTopOrBottomSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, ILookMoveDeckCardsTopOrBottomProperties> {
    public override readonly name = 'lookMoveDeckCardsTopOrBottomSystem';
    protected override readonly eventName = EventName.OnLookMoveDeckCardsTopOrBottom;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override eventHandler(event): void { }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext): void {
        const player = context.player;
        const { amount } = this.generatePropertiesFromContext(context);
        const deckLength = player.drawDeck.length;

        if (deckLength === 1) {
            const lookAtEvent = new LookAtSystem({
                target: player.drawDeck[0]
            }).generateEvent(context);
            events.push(lookAtEvent);
        } else {
            const actualAmount = Math.min(amount, deckLength);
            const cards = player.drawDeck.slice(0, actualAmount);

            context.game.promptDisplayCardsWithButtons(player, {
                activePromptTitle: 'Select card to move to the top or bottom of the deck',
                source: context.source,
                displayCards: cards,
                perCardButtons: [
                    { text: 'Put on top', arg: 'top' },
                    { text: 'Put on bottom', arg: 'bottom' }
                ],
                onCardButton: (card: Card, arg: string) => {
                    this.pushMoveEvent(arg, card, events, context);
                    return true;
                }
            });
        }
    }

    public override defaultTargets(context: TContext): Player[] {
        return [context.player];
    }

    public override canAffect(target: Player | Player[], context: TContext, additionalProperties?: any, mustChangeGameState?: GameStateChangeRequired): boolean {
        let nonAraTarget: Player;

        if (Array.isArray(target)) {
            if (target.length > 1) {
                throw new Error('Support for multiple players in LookMoveDeckCardsTopOrBottomSystem not implemented yet');
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
        let bottom: boolean;
        if (arg === 'top') {
            bottom = false;
        } else if (arg === 'bottom') {
            bottom = true;
        } else {
            Contract.fail(`Unknown arg: ${arg}`);
        }

        // create a new card event
        const moveCardEvent = new MoveCardSystem({
            destination: bottom ? DeckZoneDestination.DeckBottom : DeckZoneDestination.DeckTop,
            target: card
        }).generateEvent(context);
        events.push(moveCardEvent);
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