import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { CardType, EffectName, EventName, GameStateChangeRequired, Location, LocationFilter, WildcardCardType } from '../core/Constants';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';

export interface IMoveCardProperties extends ICardTargetSystemProperties {
    destination?: Location;
    locationFilter?: LocationFilter | LocationFilter[];
    switch?: boolean;
    switchTarget?: Card;
    shuffle?: boolean;
    // TODO: remove completely if faceup logic is not needed
    // faceup?: boolean;
    bottom?: boolean;
    changePlayer?: boolean;
    discardDestinationCards?: boolean;
}

// TODO: since there are already some more specific for moving to arena, hand, etc., what's the remaining use case for this? and can we rename it to be more specific?
export class MoveCardSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IMoveCardProperties> {
    public override readonly name = 'move';
    protected override readonly eventName = EventName.OnCardMoved;
    public override targetTypeFilter = [WildcardCardType.Unit, WildcardCardType.Upgrade, CardType.Event];

    protected override defaultProperties: IMoveCardProperties = {
        destination: null,
        switch: false,
        switchTarget: null,
        shuffle: false,
        bottom: false,
        changePlayer: false,
    };

    public eventHandler(event: any, additionalProperties = {}): void {
        // Check if the card is leaving play
        if (EnumHelpers.isArena(event.card.location) && !EnumHelpers.isArena(event.destination)) {
            this.leavesPlayEventHandler(event, additionalProperties);
        } else {
            // TODO: remove this completely if determinmed we don't need card snapshots
            // event.cardStateWhenMoved = card.createSnapshot();
            const card = event.card as Card;

            if (event.switch && event.switchTarget) {
                const otherCard = event.switchTarget;
                card.owner.moveCard(otherCard, card.location);
            }

            const player = event.changePlayer && card.controller.opponent ? card.controller.opponent : card.controller;
            player.moveCard(card, event.destination, event.options);

            // TODO: use ShuffleDeckSystem instead
            if (event.destination === Location.Deck && event.shuffle) {
                card.owner.shuffleDeck();
            }
        }
    }

    public override getCostMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context) as IMoveCardProperties;
        if (properties.destination === Location.Hand) {
            return ['return {0} to their hand', [properties.target]];
        } else if (properties.destination === Location.Deck) {
            if (properties.shuffle) {
                return ['shuffle {0} into their deck', [properties.target]];
            }
            return ['move {0} to the {1} of their deck', [properties.target, properties.bottom ? 'bottom' : 'top']];
        } else if (properties.destination === Location.Discard) {
            return ['discard {0}', [properties.target]];
        }
        return ['move {0} to {1}', [properties.target, properties.destination]];
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context) as IMoveCardProperties;
        const destinationController = Array.isArray(properties.target)
            ? properties.changePlayer
                ? properties.target[0].controller.opponent
                : properties.target[0].controller
            : properties.changePlayer
                ? properties.target.controller.opponent
                : properties.target.controller;
        if (properties.shuffle) {
            return ['shuffle {0} into {1}\'s {2}', [properties.target, destinationController, properties.destination]];
        } else if (properties.destination === Location.Hand) {
            return ['return {0} to {1}\'s hand', [properties.target, destinationController]];
        }
        return [
            'move {0} to ' + (properties.bottom ? 'the bottom of ' : '') + '{1}\'s {2}',
            [properties.target, destinationController, properties.destination]
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

        event.switch = properties.switch;
        event.switchTarget = properties.switchTarget;
        event.changePlayer = properties.changePlayer;
        event.destination = properties.destination;
        event.shuffle = properties.shuffle;
        event.locationFilter = properties.locationFilter;
        event.options = { bottom: !!properties.bottom };
    }

    public override canAffect(card: Card, context: TContext, additionalProperties = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const { changePlayer, destination, locationFilter } = this.generatePropertiesFromContext(context, additionalProperties) as IMoveCardProperties;

        // Ensure that we have a valid destination and that the card can be moved there
        if (!destination || !context.player.isLegalLocationForCardType(card.type, destination)) {
            return false;
        }

        // Ensure that the card has no restrictions that would prevent it from being moved to a different player
        if (changePlayer && (card.hasRestriction(EffectName.TakeControl, context) || card.anotherUniqueInPlay(context.player))) {
            return false;
        }

        // Ensure that if the card is in play, it can only be moved to the hand or deck
        if (EnumHelpers.isArena(card.location) && destination !== Location.Hand && destination !== Location.Deck) {
            return false;
        }

        // Ensure that the card is in the correct location
        if (locationFilter && !EnumHelpers.cardLocationMatches(card.location, locationFilter)) {
            return false;
        }

        // Call the super implementation
        return super.canAffect(card, context, additionalProperties, mustChangeGameState);
    }
}