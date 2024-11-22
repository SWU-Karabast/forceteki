import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { CardType, EventName, GameStateChangeRequired, ZoneName, MoveZoneDestination, DeckZoneDestination, WildcardCardType } from '../core/Constants';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import * as Helpers from '../core/utils/Helpers.js';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import * as Contract from '../core/utils/Contract';

/**
 * Properties for moving a card within the game.
 *
 * @remarks
 * Use this interface to specify the properties when moving a card to a new zone.
 * Note that to move cards to the discard pile, any arena, or to the resources, you should use the appropriate systems
 * such as {@link DiscardSpecificCardSystem}, {@link PlayCardSystem}, or {@link ResourceCardSystem}.
 *
 * @property destination - The target zone for the card. Excludes discard pile, space arena, ground arena, and resources.
 * @property shuffle - Indicates whether the card should be shuffled into the destination.
 * @property bottom - Indicates whether the card should be placed at the bottom of the destination.
 */
export interface IMoveCardProperties extends ICardTargetSystemProperties {
    destination?: Exclude<MoveZoneDestination, ZoneName.Discard | ZoneName.SpaceArena | ZoneName.GroundArena | ZoneName.Resource>;
    shuffle?: boolean;
}

// TODO: since there are already some more specific for moving to arena, hand, etc., what's the remaining use case for this? and can we rename it to be more specific?
export class MoveCardSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IMoveCardProperties> {
    public override readonly name = 'move';
    protected override readonly eventName = EventName.OnCardMoved;
    public override targetTypeFilter = [WildcardCardType.Unit, WildcardCardType.Upgrade, CardType.Event];

    protected override defaultProperties: IMoveCardProperties = {
        destination: null,
        shuffle: false,
    };

    public eventHandler(event: any, additionalProperties = {}): void {
        // Check if the card is leaving play
        if (EnumHelpers.isArena(event.card.zoneName) && !EnumHelpers.isArena(event.destination)) {
            this.leavesPlayEventHandler(event.card, event.destination, event.context, () => event.card.moveTo(event.destination));
        } else {
            // TODO: remove this completely if determined we don't need card snapshots
            // event.cardStateWhenMoved = card.createSnapshot();
            const card = event.card as Card;

            card.moveTo(event.destination);

            // TODO: use ShuffleDeckSystem instead
            if (event.destination === ZoneName.Deck && event.shuffle) {
                card.owner.shuffleDeck();
            }
        }
    }

    public override getCostMessage(context: TContext): [string, any[]] {
        return this.getEffectMessage(context);
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context) as IMoveCardProperties;
        if (properties.destination === ZoneName.Hand) {
            if (Helpers.asArray(properties.target).some((card) => card.zoneName === ZoneName.Resource)) {
                const targets = Helpers.asArray(properties.target);
                return ['return {0} to their hand', [targets.length > 1 ? `${targets.length} resources` : 'a resource']];
            }
            return ['return {0} to their hand', [properties.target]];
        } else if (EnumHelpers.isDeckMoveZone(properties.destination)) {
            if (properties.shuffle) {
                return ['shuffle {0} into their deck', [properties.target]];
            }
            return ['move {0} to the {1} of their deck', [properties.target, properties.destination === DeckZoneDestination.DeckBottom ? 'bottom' : 'top']];
        }
        return [
            'move {0} to ' + (properties.destination === DeckZoneDestination.DeckBottom ? 'the bottom of ' : '') + 'their {1}',
            [properties.target, properties.destination]
        ];
    }

    protected override updateEvent(event, card: Card, context: TContext, additionalProperties): void {
        super.updateEvent(event, card, context, additionalProperties);

        // Check if the card is leaving play
        if (EnumHelpers.isArena(card.zoneName) && !EnumHelpers.isArena(event.destination)) {
            this.addLeavesPlayPropertiesToEvent(event, card, context, additionalProperties);
        }
    }

    public override addPropertiesToEvent(event: any, card: Card, context: TContext, additionalProperties?: any): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        super.addPropertiesToEvent(event, card, context, additionalProperties);

        event.destination = properties.destination;
        event.shuffle = properties.shuffle;
    }

    public override canAffect(card: Card, context: TContext, additionalProperties = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const { destination } = this.generatePropertiesFromContext(context, additionalProperties) as IMoveCardProperties;

        // Ensure that we have a valid destination and that the card can be moved there
        Contract.assertTrue(
            destination && context.player.isLegalZoneForCardType(card.type, destination),
            `${destination} is not a valid zone for ${card.type}`
        );

        // Ensure that if the card is returning to the hand, it must be in the discard pile or in play or be a resource
        if (destination === ZoneName.Hand) {
            Contract.assertTrue(
                [ZoneName.Discard, ZoneName.Resource].includes(card.zoneName) || EnumHelpers.isArena(card.zoneName),
                `Cannot use MoveCardSystem to return a card to hand from ${card.zoneName}`
            );
        }

        // Call the super implementation
        return super.canAffect(card, context, additionalProperties, mustChangeGameState);
    }
}
