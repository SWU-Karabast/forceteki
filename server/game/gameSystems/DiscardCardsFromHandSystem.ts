import { CardTypeFilter, EventName, GameStateChangeRequired, ZoneName, RelativePlayer, TargetMode, WildcardCardType } from '../core/Constants';
import { AbilityContext } from '../core/ability/AbilityContext';
import type Player from '../core/Player';
import { IPlayerTargetSystemProperties, PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import { Card } from '../core/card/Card';
import { DiscardSpecificCardSystem } from './DiscardSpecificCardSystem';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import * as Helpers from '../core/utils/Helpers';
import { Derivable, derive } from '../core/utils/Helpers';
import * as Contract from '../core/utils/Contract';


export interface DiscardSubEvent {
    discardingPlayer: Player;
    targetPlayer: Player;
}

export interface IDiscardCardsFromHandProperties extends IPlayerTargetSystemProperties {
    amount: Derivable<number, Player>;
    random?: boolean;

    /* TODO: Add a reveal system to flip over the cards if discarding from an opponent, also in the future
    this may be necessary for a player discarding from their own ahnds if a card condition or filter exits to keep them honest */
    cardTypeFilter?: CardTypeFilter | CardTypeFilter[];
    cardCondition?: (card: Card, context: AbilityContext) => boolean;
    discardSubEvents?: DiscardSubEvent[];
}

export class DiscardCardsFromHandSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, IDiscardCardsFromHandProperties> {
    protected override defaultProperties: IDiscardCardsFromHandProperties = {
        amount: 1,
        random: false,
        cardTypeFilter: WildcardCardType.Any,
        cardCondition: () => true,
        discardSubEvents: []
    };

    public override name = 'discard';
    public override eventName = EventName.OnCardsDiscardedFromHand;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override eventHandler(_event): void { }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);

        const discardingPlayerStr = `[${properties.discardSubEvents.map((event) => event.discardingPlayer).join(', ')}]`;
        const targetPlayersStr = `[${properties.discardSubEvents.map((event) => event.targetPlayer).join(', ')}]`;

        return ['make {0} {1}discard {2} cards from {3}', [discardingPlayerStr, properties.random ? 'randomly ' : '', properties.amount, targetPlayersStr]];
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
        for (const discardSubEvent of properties.discardSubEvents) {
            const availableHand = discardSubEvent.targetPlayer.hand.filter((card) => properties.cardCondition(card, context));

            Contract.assertNonNegative(derive(properties.amount, discardSubEvent.targetPlayer));

            const amount = Math.min(availableHand.length, derive(properties.amount, discardSubEvent.targetPlayer));

            if (amount === 0 && discardSubEvent.discardingPlayer.autoSingleTarget) {
                events.push(this.generateEvent(context, additionalProperties));
                continue;
            }

            if (amount >= availableHand.length && discardSubEvent.discardingPlayer.autoSingleTarget) {
                this.generateEventsForCards(availableHand, context, events, additionalProperties);
                continue;
            }

            if (properties.random) {
                const randomCards = Helpers.getRandomArrayElements(availableHand, amount);
                this.generateEventsForCards(randomCards, context, events, additionalProperties);
                continue;
            }

            context.game.promptForSelect(discardSubEvent.discardingPlayer, {
                activePromptTitle: 'Choose ' + (amount === 1 ? 'a card' : amount + ' cards') + ' to discard',
                context: context,
                mode: TargetMode.Exactly,
                numCards: amount,
                zoneFilter: ZoneName.Hand,
                controller: discardSubEvent.targetPlayer === context.player ? RelativePlayer.Self : RelativePlayer.Opponent, // TODO: I want this to be explicit
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
