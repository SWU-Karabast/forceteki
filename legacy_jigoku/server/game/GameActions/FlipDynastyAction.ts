import type { AbilityContext } from '../AbilityContext';
import type BaseCard from '../basecard';
import { CardTypes, EventNames } from '../Constants';
import { type CardActionProperties, CardGameAction } from './CardGameAction';

export interface FlipDynastyProperties extends CardActionProperties {}

export class FlipDynastyAction extends CardGameAction<FlipDynastyProperties> {
    name = 'reveal';
    eventName = EventNames.OnCardRevealed;
    targetType = [CardTypes.Character, CardTypes.Holding, CardTypes.Event];

    getEffectMessage(context): [string, any[]] {
        let properties = this.getProperties(context);
        return ['reveal the facedown card in {0}', [properties.target[0].location]];
    }

    canAffect(card: BaseCard, context: AbilityContext): boolean {
        return card.isInProvince() && card.isDynasty && card.isFacedown() && super.canAffect(card, context);
    }

    eventHandler(event): void {
        event.card.facedown = false;
    }
}