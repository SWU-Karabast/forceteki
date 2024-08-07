import type { AbilityContext } from '../core/ability/AbilityContext';
import { CardType, EventName, TargetableLocation, Location, WildcardLocation } from '../core/Constants';
import { cardLocationMatches } from '../core/utils/EnumHelpers';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import Card from '../core/card/Card';

export interface IReturnToDeckProperties extends ICardTargetSystemProperties {
    bottom?: boolean;
    shuffle?: boolean;
    location?: TargetableLocation | TargetableLocation[];
}

export class ReturnToDeckSystem extends CardTargetSystem {
    override name = 'returnToDeck';
    override eventName = EventName.OnCardDefeated;
    override targetType = [CardType.Unit, CardType.Upgrade, CardType.Event];
    override defaultProperties: IReturnToDeckProperties = {
        bottom: false,
        shuffle: false,
        location: WildcardLocation.AnyArena
    };
    constructor(properties: ((context: AbilityContext) => IReturnToDeckProperties) | IReturnToDeckProperties) {
        super(properties);
    }

    override getCostMessage(context: AbilityContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context) as IReturnToDeckProperties;
        return [
            properties.shuffle
                ? 'shuffling {0} into their deck'
                : 'returning {0} to the ' + (properties.bottom ? 'bottom' : 'top') + ' of their deck',
            [properties.target]
        ];
    }

    override getEffectMessage(context: AbilityContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context) as IReturnToDeckProperties;
        if (properties.shuffle) {
            return ["shuffle {0} into its owner's deck", [properties.target]];
        }
        return [
            'return {0} to the ' + (properties.bottom ? 'bottom' : 'top') + " of its owner's deck",
            [properties.target]
        ];
    }

    override canAffect(card: Card, context: AbilityContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context) as IReturnToDeckProperties;
        let location: TargetableLocation[];
        if (!Array.isArray(properties.location)) {
            location = [properties.location];
        } else {
            location = properties.location;
        }

        return (
            location.some((permittedLocation) => cardLocationMatches(card.location, permittedLocation)) &&
            super.canAffect(card, context, additionalProperties)
        );
    }

    // updateEvent(event, card: BaseCard, context: AbilityContext, additionalProperties): void {
    //     let { shuffle, target, bottom } = this.generatePropertiesFromContext(context, additionalProperties) as ReturnToDeckProperties;
    //     this.updateLeavesPlayEvent(event, card, context, additionalProperties);
    //     event.destination = Location.Deck;
    //     event.options = { bottom };
    //     if (shuffle && (target.length === 0 || card === target[target.length - 1])) {
    //         event.shuffle = true;
    //     }
    // }

    eventHandler(event, additionalProperties = {}): void {
        this.leavesPlayEventHandler(event, additionalProperties);
        if (event.shuffle) {
            event.card.owner.shuffleDeck();
        }
    }
}
