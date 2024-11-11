import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { CardType, EventName, GameStateChangeRequired, Location, WildcardCardType } from '../core/Constants';
import * as Contract from '../core/utils/Contract';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import * as Helpers from '../core/utils/Helpers.js';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';

/**
 * Properties for moving a card within the game.
 *
 * @remarks
 * Use this interface to specify the properties when moving a card to a new location.
 * Note that to move cards to the discard pile, any arena, or to the resources, you should use the appropriate systems
 * such as {@link DiscardSpecificCardSystem}, {@link PlayCardSystem}, or {@link ResourceCardSystem}.
 *
 * @property destination - The target location for the card. Excludes discard pile, space arena, ground arena, and resources.
 * @property shuffle - Indicates whether the card should be shuffled into the destination.
 * @property bottom - Indicates whether the card should be placed at the bottom of the destination.
 */
export interface IMoveCardProperties extends ICardTargetSystemProperties {
    destination?: Exclude<Location, Location.Discard | Location.SpaceArena | Location.GroundArena | Location.Resource>;
    shuffle?: boolean;
    bottom?: boolean;
}

// TODO: since there are already some more specific for moving to arena, hand, etc., what's the remaining use case for this? and can we rename it to be more specific?
export class MoveCardSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IMoveCardProperties> {
    public override readonly name = 'move';
    protected override readonly eventName = EventName.OnCardMoved;
    public override targetTypeFilter = [WildcardCardType.Unit, WildcardCardType.Upgrade, CardType.Event];

    protected override defaultProperties: IMoveCardProperties = {
        destination: null,
        shuffle: false,
        bottom: false,
    };

    public eventHandler(event: any, additionalProperties = {}): void {
        // Check if the card is leaving play
        if (EnumHelpers.isArena(event.card.location) && !EnumHelpers.isArena(event.destination)) {
            this.leavesPlayEventHandler(event, additionalProperties);
        } else {
            // TODO: remove this completely if determinmed we don't need card snapshots
            // event.cardStateWhenMoved = card.createSnapshot();
            const card = event.card as Card;

            const player = event.changePlayer && card.controller.opponent ? card.controller.opponent : card.controller;
            player.moveCard(card, event.destination, event.options);

            // TODO: use ShuffleDeckSystem instead
            if (event.destination === Location.Deck && event.shuffle) {
                card.owner.shuffleDeck();
            }
        }
    }

    public override getCostMessage(context: TContext): [string, any[]] {
        return this.getEffectMessage(context);
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context) as IMoveCardProperties;
        if (properties.destination === Location.Hand) {
            if (Helpers.asArray(properties.target).some((card) => EnumHelpers.cardLocationMatches(card.location, Location.Resource))) {
                const targets = Helpers.asArray(properties.target);
                return ['return {0} to their hand', [targets.length > 1 ? `${targets.length} resources` : 'a resource']];
            }
            return ['return {0} to their hand', [properties.target]];
        } else if (properties.destination === Location.Deck) {
            if (properties.shuffle) {
                return ['shuffle {0} into their deck', [properties.target]];
            }
            return ['move {0} to the {1} of their deck', [properties.target, properties.bottom ? 'bottom' : 'top']];
        }
        return [
            'move {0} to ' + (properties.bottom ? 'the bottom of ' : '') + 'their {1}',
            [properties.target, properties.destination]
        ];
    }

    protected override updateEvent(event, card: Card, context: TContext, additionalProperties): void {
        // Check if the card is leaving play
        if (EnumHelpers.isArena(card.location) && !EnumHelpers.isArena(event.destination)) {
            this.addLeavesPlayPropertiesToEvent(event, card, context, additionalProperties);
        } else {
            super.updateEvent(event, card, context, additionalProperties);
        }
    }

    public override addPropertiesToEvent(event: any, card: Card, context: TContext, additionalProperties?: any): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        super.addPropertiesToEvent(event, card, context, additionalProperties);

        event.destination = properties.destination;
        event.shuffle = properties.shuffle;
        event.options = { bottom: !!properties.bottom };
    }

    public override canAffect(card: Card, context: TContext, additionalProperties = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const { destination } = this.generatePropertiesFromContext(context, additionalProperties) as IMoveCardProperties;

        // Ensure that we have a valid destination and that the card can be moved there
        Contract.assertTrue(
            destination && context.player.isLegalLocationForCardType(card.type, destination),
            `${destination} is not a valid location for ${card.type}`
        );

        // Ensure that if the card is returning to the hand, it must be in the discard pile or in play or be a resource
        if (destination === Location.Hand) {
            Contract.assertTrue(
                [Location.Discard, Location.Resource].includes(card.location) || EnumHelpers.isArena(card.location),
                `Cannot use MoveCardSystem to return a card to hand from ${card.location}`
            );
        }

        // Call the super implementation
        return super.canAffect(card, context, additionalProperties, mustChangeGameState);
    }
}