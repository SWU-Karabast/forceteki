import type { AbilityContext } from '../AbilityContext';
import type BaseCard from '../basecard';
import { CardTypes, EventNames, Locations } from '../Constants';
import { type CardActionProperties, CardGameAction } from './CardGameAction';

export interface RemoveFromGameProperties extends CardActionProperties {
    location?: Locations | Locations[];
}

export class RemoveFromGameAction extends CardGameAction {
    name = 'removeFromGame';
    eventName = EventNames.OnCardLeavesPlay;
    cost = 'removing {0} from the game';
    targetType = [CardTypes.Character, CardTypes.Attachment, CardTypes.Holding, CardTypes.Event];
    effect = 'remove {0} from the game';

    canAffect(card: BaseCard, context: AbilityContext, additionalProperties): boolean {
        const properties = this.getProperties(context, additionalProperties) as RemoveFromGameProperties;
        const propValidLocations = Array.isArray(properties.location)
            ? properties.location
            : properties.location
            ? [properties.location]
            : undefined;

        if (propValidLocations) {
            for (const validLocation of propValidLocations) {
                if (validLocation === Locations.Any || card.location === validLocation) {
                    return true;
                }
            }
            return false;
        }

        if (card.type === CardTypes.Holding) {
            if (!card.location.includes('province')) {
                return false;
            }
        } else if (card.location !== Locations.PlayArea) {
            return false;
        }

        return super.canAffect(card, context);
    }

    updateEvent(event, card: BaseCard, context: AbilityContext, additionalProperties): void {
        additionalProperties.destination = Locations.RemovedFromGame;
        this.updateLeavesPlayEvent(event, card, context, additionalProperties);
    }

    eventHandler(event, additionalProperties = {}): void {
        this.leavesPlayEventHandler(event, additionalProperties);
    }
}
