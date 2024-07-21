import type { AbilityContext } from '../AbilityContext';
import { CardTypes, EventNames, Locations } from '../Constants';
import type DrawCard from '../drawcard';
import type { Duel } from '../Duel';
import { type CardActionProperties, CardGameAction } from './CardGameAction';

export interface DuelAddParticipantProperties extends CardActionProperties {
    duel: Duel;
}

export class DuelAddParticipantAction extends CardGameAction<DuelAddParticipantProperties> {
    name = 'onAddDuelParticipant';
    eventName = EventNames.OnAddDuelParticipant;

    getEffectMessage(context: AbilityContext): [string, any[]] {
        let properties = this.getProperties(context);
        return ['extend the duel challenge to {0}', [properties.target]];
    }

    canAffect(card: DrawCard, context: AbilityContext, additionalProperties = {}): boolean {
        let properties = this.getProperties(context, additionalProperties);

        if (card.type !== CardTypes.Character) {
            return false;
        }
        if (card.location !== Locations.PlayArea) {
            return false;
        }

        if (!card.allowGameAction('duel', context)) {
            return false;
        }

        return properties.duel.canAddToDuel(card, context);
    }

    addPropertiesToEvent(event, card: DrawCard, context: AbilityContext, additionalProperties): void {
        let { duel } = this.getProperties(context, additionalProperties);
        super.addPropertiesToEvent(event, card, context, additionalProperties);
        event.duel = duel;
    }

    eventHandler(event): void {
        event.duel.addTargetToDuel(event.card);
    }
}