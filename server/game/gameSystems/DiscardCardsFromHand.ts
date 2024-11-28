import { CardTypeFilter, EventName, GameStateChangeRequired, ZoneName, RelativePlayer, TargetMode } from '../core/Constants';
import { AbilityContext } from '../core/ability/AbilityContext';
import type Player from '../core/Player';
import { IPlayerTargetSystemProperties, PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import { Card } from '../core/card/Card';
import { DiscardSpecificCardSystem } from './DiscardSpecificCardSystem';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import * as Helpers from '../core/utils/Helpers';
import { Derivable, derive } from '../core/utils/Helpers';
import * as Contract from '../core/utils/Contract';

export interface IDiscardCardsFromHandProperties extends IPlayerTargetSystemProperties {
    amount: Derivable<number, Player>;
    random?: boolean;

    /* TODO: Add reveal system to when card type filter or card condition exists, as this is required to keep the
    in order to keep the player honest in a in-person game */
    cardTypeFilter?: CardTypeFilter | CardTypeFilter[];
    cardCondition?: (card: Card, context: AbilityContext) => boolean;
}

export class DiscardCardsFromHand<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, IDiscardCardsFromHandProperties> {
    protected override defaultProperties: IDiscardCardsFromHandProperties = {
        amount: 1,
        cardCondition: () => true
    };

    public override name = 'discard';
    public override eventName = EventName.OnCardsDiscardedFromHand;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override eventHandler(_event): void { }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        return ['make {0} discard {1} cards', [properties.target, properties.amount]];
    }

    public override canAffect(playerOrPlayers: Player | Player[], context: TContext, additionalProperties = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        for (const player of Helpers.asArray(playerOrPlayers)) {
            const properties = this.generatePropertiesFromContext(context, additionalProperties);
            const availableHand = player.hand.filter((card) => properties.cardCondition(card, context) && EnumHelpers.cardTypeMatches(card.type, properties.cardTypeFilter));

            if (mustChangeGameState !== GameStateChangeRequired.None && (availableHand.length === 0 || properties.amount === 0)) {
                return false;
            }

            if ((properties.isCost || mustChangeGameState === GameStateChangeRequired.MustFullyResolve) && availableHand.length < derive(properties.amount, player)) {
                return false;
            }

            if (!super.canAffect(player, context, additionalProperties)) {
                return false;
            }
        }
        return true;
    }

    public override queueGenerateEventGameSteps(events: any[], context: TContext, additionalProperties: Record<string, any> = {}): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        for (const player of properties.target as Player[]) {
            const availableHand = player.hand.filter((card) => properties.cardCondition(card, context));

            Contract.assertNonNegative(derive(properties.amount, player));

            const amount = Math.min(availableHand.length, derive(properties.amount, player));

            if (amount === 0) {
                events.push(this.generateEvent(context, additionalProperties));
                continue;
            }

            if (amount >= availableHand.length) {
                this.generateEventsForCards(availableHand, context, events, additionalProperties);
                continue;
            }

            if (properties.random) {
                const randomCards = Helpers.getRandomArrayElements(availableHand, amount);
                this.generateEventsForCards(randomCards, context, events, additionalProperties);
                continue;
            }

            context.game.promptForSelect(player, {
                activePromptTitle: 'Choose ' + (amount === 1 ? 'a card' : amount + ' cards') + ' to discard',
                context: context,
                mode: TargetMode.Exactly,
                numCards: amount,
                zoneFilter: ZoneName.Hand,
                controller: player === context.player ? RelativePlayer.Self : RelativePlayer.Opponent,
                cardCondition: (card) => properties.cardCondition(card, context),
                onSelect: (_player, cards) => {
                    this.generateEventsForCards(cards, context, events, additionalProperties);
                    return true;
                }
            });
        }
    }

    private generateEventsForCards(cards: Card[], context: TContext, events: any[], additionalProperties: Record<string, any>): void {
        cards.forEach((card) => {
            const specificDiscardEvent = new DiscardSpecificCardSystem({ target: card }).generateEvent(context);
            events.push(specificDiscardEvent);
        });
        // TODO: Update this to include partial resolution once added for discards that could not be done to fullest extent.

        // Add a final event to convey overall event resolution status.
        events.push(this.generateEvent(context, additionalProperties));
    }
}
