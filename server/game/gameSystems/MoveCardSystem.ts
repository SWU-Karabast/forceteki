import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { CardType, EffectName, EventName, Location, MoveLocation, MoveToDeckLocation, WildcardCardType } from '../core/Constants';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';

export interface IMoveCardProperties extends ICardTargetSystemProperties {
    destination?: MoveLocation;
    switch?: boolean;
    switchTarget?: Card;
    shuffle?: boolean;
    // TODO: remove completely if faceup logic is not needed
    // faceup?: boolean;
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
        changePlayer: false,
    };

    public eventHandler(event: any, additionalProperties = {}): void {
        // TODO: remove this completely if determinmed we don't need card snapshots
        // event.cardStateWhenMoved = card.createSnapshot();
        const card = event.card as Card;

        if (event.switch && event.switchTarget) {
            const otherCard = event.switchTarget;
            otherCard.moveTo(card.location);
        }

        // TODO TAKE CONTROL: change controller on move logic
        // const player = event.changePlayer && card.controller.opponent ? card.controller.opponent : card.controller;

        if (EnumHelpers.isArena(card.location) && !EnumHelpers.isArena(event.destination)) {
            this.leavesPlayEventHandler(event, additionalProperties);
        } else {
            card.moveTo(event.destination);
        }

        // TODO: use ShuffleDeckSystem instead
        if (event.destination === Location.Deck && event.shuffle) {
            card.owner.shuffleDeck();
        }
    }

    public override getCostMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context) as IMoveCardProperties;
        return ['shuffling {0} into their deck', [properties.target]];
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
        }
        return [
            'move {0} to ' + (properties.destination === MoveToDeckLocation.DeckBottom ? 'the bottom of ' : '') + '{1}\'s {2}',
            [properties.target, destinationController, properties.destination]
        ];
    }

    public override addPropertiesToEvent(event: any, card: Card, context: TContext, additionalProperties?: any): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        super.addPropertiesToEvent(event, card, context, additionalProperties);

        event.switch = properties.switch;
        event.switchTarget = properties.switchTarget;
        event.changePlayer = properties.changePlayer;
        event.destination = properties.destination;
        event.shuffle = properties.shuffle;
    }

    public override canAffect(card: Card, context: TContext, additionalProperties = {}): boolean {
        const { changePlayer, destination } = this.generatePropertiesFromContext(context, additionalProperties) as IMoveCardProperties;
        return (
            (!changePlayer ||
              (!card.hasRestriction(EffectName.TakeControl, context) &&
                !card.anotherUniqueInPlay(context.player))) &&
                (!destination || context.player.isLegalLocationForCardType(card.type, destination)) &&
                !EnumHelpers.isArena(card.location) &&
                super.canAffect(card, context)
        );
    }
}