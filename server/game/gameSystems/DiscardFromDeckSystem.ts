import { AbilityContext } from '../core/ability/AbilityContext';
import { Card } from '../core/card/Card';
import { EventName, GameStateChangeRequired } from '../core/Constants';
import { IPlayerTargetSystemProperties, PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import Player from '../core/Player';
import { DiscardSpecificCardSystem } from './DiscardSpecificCardSystem';
import * as Contract from '../core/utils/Contract';

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
        return ['discard ' + (properties.amount + (properties.amount > 1 ? ' cards' : ' card') + ' from deck'), []];
    }

    public override canAffect(player: Player, context: TContext, additionalProperties = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        const players = Array.isArray(player) ? player : [player];

        for (const currentPlayer of players) {
            const availableDeck = currentPlayer.drawDeck;
            Contract.assertNonNegative(properties.amount);

            if (properties.amount === 0) {
                return false;
            }

            if (mustChangeGameState !== GameStateChangeRequired.None && availableDeck.length === 0) {
                return false;
            }

            if ((properties.isCost || mustChangeGameState === GameStateChangeRequired.MustFullyResolve) && availableDeck.length < properties.amount) {
                return false;
            }

            if (!super.canAffect(currentPlayer, context, additionalProperties)) {
                return false;
            }
        }

        return super.canAffect(player, context);
    }

    protected override addPropertiesToEvent(event, player: Player, context: TContext, additionalProperties): void {
        const { amount } = this.generatePropertiesFromContext(context, additionalProperties);
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.amount = amount;
    }

    public override queueGenerateEventGameSteps(events: any[], context: TContext, additionalProperties: Record<string, any> = {}): void {
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

    private generateEventsForCard(card: Card, context: TContext, events: any[], additionalProperties: Record<string, any>): void {
        const specificDiscardEvent = new DiscardSpecificCardSystem({ target: card }).generateEvent(context);
        events.push(specificDiscardEvent);
        // TODO: Update this to include partial resolution once added for discards that could not be done to fullest extent.
    }
}
