import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { EventName, GameStateChangeRequired } from '../core/Constants';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import type { Player } from '../core/Player';
import { DiscardSpecificCardSystem } from './DiscardSpecificCardSystem';
import * as Contract from '../core/utils/Contract';
import * as ChatHelpers from '../core/chat/ChatHelpers';
import type { GameEvent } from '../core/event/GameEvent';

export interface IDiscardFromDeckProperties extends IPlayerTargetSystemProperties {
    amount?: number;
}

export class DiscardFromDeckSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, IDiscardFromDeckProperties> {
    public override readonly name = 'discardFromDeck';
    public override readonly eventName = EventName.OnDiscardFromDeck;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override eventHandler(_event): void { }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        return ['discard {0} from deck', [ChatHelpers.pluralize(properties.amount, 'a card', 'cards')]];
    }

    public override canAffectInternal(player: Player, context: TContext, additionalProperties: Partial<IDiscardFromDeckProperties> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        const players = Array.isArray(player) ? player : [player];
        Contract.assertNonNegative(properties.amount);

        if (properties.amount === 0) {
            return false;
        }

        for (const currentPlayer of players) {
            const availableDeck = currentPlayer.drawDeck;

            if (mustChangeGameState !== GameStateChangeRequired.None && availableDeck.length === 0) {
                return false;
            }

            if ((properties.isCost || mustChangeGameState === GameStateChangeRequired.MustFullyResolve) && availableDeck.length < properties.amount) {
                return false;
            }

            if (!super.canAffectInternal(currentPlayer, context, additionalProperties)) {
                return false;
            }
        }

        return true;
    }

    protected override addPropertiesToEvent(event, player: Player, context: TContext, additionalProperties: Partial<IDiscardFromDeckProperties>): void {
        const { amount } = this.generatePropertiesFromContext(context, additionalProperties);
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.amount = amount;
    }

    public override queueGenerateEventGameSteps(events: any[], context: TContext, additionalProperties: Partial<IDiscardFromDeckProperties> = {}): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        for (const player of properties.target as Player[]) {
            const availableDeck = player.drawDeck;

            const amount = Math.min(availableDeck.length, properties.amount);

            if (amount === 0) {
                events.push(this.generateEvent(context, additionalProperties));
                return;
            }

            const topCards = player.getTopCardsOfDeck(amount);
            topCards.forEach((card) => this.generateEventsForCard(card, context, events, additionalProperties));

            // Add a final event to convey overall event resolution status.
            events.push(this.generateEvent(context, additionalProperties));
        }
    }

    protected override updateEvent(event: GameEvent, target: any, context: TContext, additionalProperties: Partial<IDiscardFromDeckProperties> = {}): void {
        super.updateEvent(event, target, context, additionalProperties);

        // all the work for this system happens in the queueGenerateEventGameSteps method and the generated discard events,
        // so the top-level discard event should just auto-succeed
        event.condition = () => true;
    }

    private generateEventsForCard(card: Card, context: TContext, events: any[], additionalProperties: Partial<IDiscardFromDeckProperties>): void {
        const specificDiscardEvent = new DiscardSpecificCardSystem({ target: card }).generateEvent(context);
        events.push(specificDiscardEvent);
        // TODO: Update this to include partial resolution once added for discards that could not be done to fullest extent.
    }
}
