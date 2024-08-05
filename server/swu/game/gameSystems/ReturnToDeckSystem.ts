import type { AbilityContext } from '../core/ability/AbilityContext';
import { CardTypes, EventNames, TargetableLocations, Locations, WildcardLocations, cardLocationMatches } from '../core/Constants';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import Card from '../core/card/Card';

export interface IReturnToDeckProperties extends ICardTargetSystemProperties {
    bottom?: boolean;
    shuffle?: boolean;
    location?: TargetableLocations | TargetableLocations[];
}

export class ReturnToDeckSystem extends CardTargetSystem {
    name = 'returnToDeck';
    eventName = EventNames.OnCardDefeated;
    targetType = [CardTypes.Unit, CardTypes.Upgrade, CardTypes.Event];
    defaultProperties: IReturnToDeckProperties = {
        bottom: false,
        shuffle: false,
        location: WildcardLocations.AnyArena
    };
    constructor(properties: ((context: AbilityContext) => IReturnToDeckProperties) | IReturnToDeckProperties) {
        super(properties);
    }

    getCostMessage(context: AbilityContext): [string, any[]] {
        let properties = this.getProperties(context) as IReturnToDeckProperties;
        return [
            properties.shuffle
                ? 'shuffling {0} into their deck'
                : 'returning {0} to the ' + (properties.bottom ? 'bottom' : 'top') + ' of their deck',
            [properties.target]
        ];
    }

    getEffectMessage(context: AbilityContext): [string, any[]] {
        let properties = this.getProperties(context) as IReturnToDeckProperties;
        if (properties.shuffle) {
            return ["shuffle {0} into its owner's deck", [properties.target]];
        }
        return [
            'return {0} to the ' + (properties.bottom ? 'bottom' : 'top') + " of its owner's deck",
            [properties.target]
        ];
    }

    canAffect(card: Card, context: AbilityContext, additionalProperties = {}): boolean {
        let properties = this.getProperties(context) as IReturnToDeckProperties;
        let location: TargetableLocations[];
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
    //     let { shuffle, target, bottom } = this.getProperties(context, additionalProperties) as ReturnToDeckProperties;
    //     this.updateLeavesPlayEvent(event, card, context, additionalProperties);
    //     event.destination = Locations.Deck;
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
