import type { CardTypeFilter } from '../core/Constants';
import { EventName, GameStateChangeRequired, TargetMode, WildcardCardType, ZoneName } from '../core/Constants';
import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Player } from '../core/Player';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import type { Card } from '../core/card/Card';
import { DiscardSpecificCardSystem } from './DiscardSpecificCardSystem';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import * as Helpers from '../core/utils/Helpers';
import * as ChatHelpers from '../core/chat/ChatHelpers';
import type { Derivable } from '../core/utils/Helpers';
import { derive } from '../core/utils/Helpers';
import * as Contract from '../core/utils/Contract';
import * as CardSelectorFactory from '../core/cardSelector/CardSelectorFactory';
import { SelectCardMode } from '../core/gameSteps/PromptInterfaces';
import type { GameEvent } from '../core/event/GameEvent';
import type { FormatMessage } from '../core/chat/GameChat';

export interface IDiscardCardsFromHandProperties extends IPlayerTargetSystemProperties {
    amount: Derivable<number, Player>;
    random?: boolean;

    /* TODO: Add a reveal system to flip over the cards if discarding from an opponent, also in the future
    this may be necessary for a player discarding from their own hands if a card condition or filter exits to keep them honest */
    cardTypeFilter?: CardTypeFilter | CardTypeFilter[];
    cardCondition?: (card: Card, context: AbilityContext) => boolean;
}

export class DiscardCardsFromHandSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, IDiscardCardsFromHandProperties> {
    protected override defaultProperties: IDiscardCardsFromHandProperties = {
        amount: 1,
        random: false,
        cardTypeFilter: WildcardCardType.Any,
        cardCondition: () => true,
    };

    public override name = 'discard';
    public override readonly eventName = EventName.OnCardsDiscardedFromHand;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override eventHandler(_event): void { }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);

        const targets = Helpers.asArray(properties.target);
        if (targets.length === 1 || new Set(targets.map((target) => derive(properties.amount, target))).size === 1) {
            return ['make {0} {1}discard {2}', [this.getTargetMessage(targets, context), properties.random ? 'randomly ' : '', ChatHelpers.pluralize(derive(properties.amount, targets[0]), 'a card', 'cards')]];
        }
        return [ChatHelpers.formatWithLength(targets.length, 'to '), targets.map((target): FormatMessage => ({
            format: 'make {0} {1}discard {2}',
            args: [target, properties.random ? 'randomly ' : '', ChatHelpers.pluralize(derive(properties.amount, target), 'a card', 'cards')]
        }))];
    }

    public override canAffectInternal(playerOrPlayers: Player | Player[], context: TContext, additionalProperties: Partial<IDiscardCardsFromHandProperties> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        for (const player of Helpers.asArray(playerOrPlayers)) {
            const properties = this.generatePropertiesFromContext(context, additionalProperties);
            const availableHand = player.hand.filter((card) => properties.cardCondition(card, context) && EnumHelpers.cardTypeMatches(card.type, properties.cardTypeFilter));

            if (mustChangeGameState !== GameStateChangeRequired.None && (availableHand.length === 0 || properties.amount === 0)) {
                return false;
            }

            if ((properties.isCost || mustChangeGameState === GameStateChangeRequired.MustFullyResolve) && availableHand.length < derive(properties.amount, player)) {
                return false;
            }

            if (!super.canAffectInternal(player, context, additionalProperties)) {
                return false;
            }
        }
        return true;
    }

    public override queueGenerateEventGameSteps(events: any[], context: TContext, additionalProperties: Partial<IDiscardCardsFromHandProperties> = {}): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        for (const player of properties.target as Player[]) {
            const availableHand = player.hand.filter((card) => properties.cardCondition(card, context));
            const choosingPlayer = player;

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
                controller: EnumHelpers.asRelativePlayer(player, context.player),
                cardCondition: (card) => properties.cardCondition(card, context)
            });

            context.game.promptForSelect(choosingPlayer, {
                activePromptTitle: `Choose ${amount === 1 ? 'a card' : amount + ' cards'} to discard for ${context.source.title}'s effect`,
                source: context.source,
                selector,
                context,
                isOpponentEffect: choosingPlayer !== context.player,
                selectCardMode: amount === 1 ? SelectCardMode.Single : SelectCardMode.Multiple,
                onSelect: (cards) => {
                    this.generateEventsForCards(Helpers.asArray(cards), context, events, additionalProperties);
                    return true;
                }
            });
        }
    }

    protected override updateEvent(event: GameEvent, target: any, context: TContext, additionalProperties: Partial<IDiscardCardsFromHandProperties> = {}): void {
        super.updateEvent(event, target, context, additionalProperties);

        // all the work for this system happens in the queueGenerateEventGameSteps method and the generated discard events,
        // so the top-level discard event should just auto-succeed
        event.condition = () => true;
    }

    private generateEventsForCards(cards: Card[], context: TContext, events: any[], additionalProperties: Partial<IDiscardCardsFromHandProperties>): void {
        cards.forEach((card) => {
            const specificDiscardEvent = new DiscardSpecificCardSystem({ target: card }).generateEvent(context);
            events.push(specificDiscardEvent);
        });
        // TODO: Update this to include partial resolution once added for discards that could not be done to fullest extent.

        // Add a final event to convey overall event resolution status.
        events.push(this.generateEvent(context, additionalProperties));
    }
}
