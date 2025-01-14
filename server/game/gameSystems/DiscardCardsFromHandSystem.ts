import type { CardTypeFilter } from '../core/Constants';
import { EventName, GameStateChangeRequired, RelativePlayer, TargetMode, WildcardCardType, ZoneName } from '../core/Constants';
import type { AbilityContext } from '../core/ability/AbilityContext';
import type Player from '../core/Player';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import type { Card } from '../core/card/Card';
import { DiscardSpecificCardSystem } from './DiscardSpecificCardSystem';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import * as Helpers from '../core/utils/Helpers';
import type { Derivable } from '../core/utils/Helpers';
import { derive } from '../core/utils/Helpers';
import * as Contract from '../core/utils/Contract';
import CardSelectorFactory from '../core/cardSelector/CardSelectorFactory';

export interface IDiscardCardsFromHandProperties extends IPlayerTargetSystemProperties {
    amount: Derivable<number, Player>;
    random?: boolean;

    /* TODO: Add a reveal system to flip over the cards if discarding from an opponent, also in the future
    this may be necessary for a player discarding from their own ahnds if a card condition or filter exits to keep them honest */
    cardTypeFilter?: CardTypeFilter | CardTypeFilter[];
    cardCondition?: (card: Card, context: AbilityContext) => boolean;
    choosingPlayer: RelativePlayer;
}

export class DiscardCardsFromHandSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, IDiscardCardsFromHandProperties> {
    protected override defaultProperties: IDiscardCardsFromHandProperties = {
        amount: 1,
        random: false,
        cardTypeFilter: WildcardCardType.Any,
        cardCondition: () => true,
        choosingPlayer: RelativePlayer.Self
    };

    public override name = 'discard';
    public override eventName = EventName.OnCardsDiscardedFromHand;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override eventHandler(_event): void { }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        if (properties.choosingPlayer === RelativePlayer.Self) {
            return ['make {0} {1}discard {2} cards', [properties.target, properties.random ? 'randomly ' : '', properties.amount]];
        }
        return ['make {0} {1}discard {2} cards from {3}', [context.player, properties.random ? 'randomly ' : '', properties.amount, properties.target]];
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

            // Select this player if its their own hand, or the active player from the context if its the 'opponent' choosing
            const choosingPlayer = properties.choosingPlayer === RelativePlayer.Self ? player : context.player;

            Contract.assertNonNegative(derive(properties.amount, player));

            const amount = Math.min(availableHand.length, derive(properties.amount, player));
            if (amount === 0) {
                // No event generated here as no discard occured
                continue;
            }

            if (amount >= availableHand.length && choosingPlayer.autoSingleTarget) {
                this.generateEventsForCards(availableHand, context, events, additionalProperties);
                continue;
            }

            if (properties.random) {
                const randomCards = Helpers.getRandomArrayElements(availableHand, amount, context.game.randomGenerator);
                this.generateEventsForCards(randomCards, context, events, additionalProperties);
                continue;
            }

            const selector = CardSelectorFactory.create({
                mode: TargetMode.Exactly,
                numCards: amount,
                zoneFilter: ZoneName.Hand,
                controller: player === context.player ? RelativePlayer.Self : RelativePlayer.Opponent,
                cardCondition: (card) => properties.cardCondition(card, context)
            });

            context.game.promptForSelect(choosingPlayer, {
                activePromptTitle: 'Choose ' + (amount === 1 ? 'a card' : amount + ' cards') + ' to discard',
                source: context.source,
                selector: selector,
                context: context,
                onSelect: (cards) => {
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
