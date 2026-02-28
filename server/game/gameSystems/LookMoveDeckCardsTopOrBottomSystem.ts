import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import type { GameEvent } from '../core/event/GameEvent';
import { GameStateChangeRequired } from '../core/Constants';
import { EventName, DeckZoneDestination } from '../core/Constants';
import { LookAtSystem } from './LookAtSystem';
import { MoveCardSystem } from './MoveCardSystem';
import * as Contract from '../core/utils/Contract';
import * as ChatHelpers from '../core/chat/ChatHelpers';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import type { Player } from '../core/Player';
import { ViewCardInteractMode } from './ViewCardSystem';
import type { FormatMessage } from '../core/chat/GameChat';

export interface ILookMoveDeckCardsTopOrBottomProperties extends IPlayerTargetSystemProperties {
    amount: number;
}

export class LookMoveDeckCardsTopOrBottomSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, ILookMoveDeckCardsTopOrBottomProperties> {
    public override readonly name = 'lookMoveDeckCardsTopOrBottomSystem';
    public override readonly eventName = EventName.OnLookMoveDeckCardsTopOrBottom;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override eventHandler(event): void { }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext): void {
        const { amount, target } = this.generatePropertiesFromContext(context);
        const player = this.getSingleTarget(target);
        const deckLength = player.drawDeck.length;

        if (deckLength > 0) {
            // context.player is looking at target's deck, which is always hidden information
            context.game.snapshotManager.setRequiresConfirmationToRollbackCurrentSnapshot(context.player.id);
        }

        if (deckLength === 1) {
            const lookAtEvent = new LookAtSystem({
                target: player.drawDeck[0],
                interactMode: ViewCardInteractMode.ViewOnly,
                useDisplayPrompt: true
            }).generateEvent(context);
            events.push(lookAtEvent);
        } else {
            const actualAmount = Math.min(amount, deckLength);
            const cards = player.drawDeck.slice(0, actualAmount);

            context.game.promptDisplayCardsWithButtons(context.player, {
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

    public override canAffectInternal(target: Player | Player[], context: TContext, additionalProperties?: Partial<ILookMoveDeckCardsTopOrBottomProperties>, mustChangeGameState?: GameStateChangeRequired): boolean {
        const nonAraTarget = this.getSingleTarget(target);

        if (mustChangeGameState !== GameStateChangeRequired.None && nonAraTarget.drawDeck.length === 0) {
            return false;
        }

        return super.canAffectInternal(target, context, additionalProperties, mustChangeGameState);
    }

    private getSingleTarget(target: Player | Player[]): Player {
        if (Array.isArray(target)) {
            Contract.assertTrue(target.length === 1, 'Support for multiple players in LookMoveDeckCardsTopOrBottomSystem not implemented yet');

            return target[0];
        }

        return target;
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
        const moveGameSystem = new MoveCardSystem({
            destination: bottom ? DeckZoneDestination.DeckBottom : DeckZoneDestination.DeckTop,
            target: card
        });
        const moveCardEvent = moveGameSystem.generateEvent(context);
        const [effectMessage, effectArgs] = moveGameSystem.getEffectMessage(context);
        context.game.addMessage('{0} chooses to {1}', context.player, [effectMessage, ...effectArgs]);
        events.push(moveCardEvent);
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        const player = this.getSingleTarget(properties.target);

        if (properties.amount === 0) {
            return ['', []];
        }

        const possessiveArg: FormatMessage | string = player === context.player
            ? 'their'
            : { format: '{0}\'s', args: [player] };

        return ['look at the top {0} of {1} deck and they {2}', [
            ChatHelpers.pluralize(properties.amount, 'card', 'cards'),
            possessiveArg,
            properties.amount === 1 ? 'may put it on the bottom of their deck' : 'put any number of them on the bottom of their deck and the rest on top in any order',
        ]];
    }
}