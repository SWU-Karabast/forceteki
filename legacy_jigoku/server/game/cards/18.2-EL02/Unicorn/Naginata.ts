import AbilityDsl from '../../../abilitydsl';
import { AbilityTypes, CardTypes } from '../../../Constants';
import DrawCard from '../../../drawcard';
import type { TriggeredAbilityProps } from '../../../Interfaces';
import type { TriggeredAbilityContext } from '../../../TriggeredAbilityContext';

export default class Naginata extends DrawCard {
    static id = 'naginata';

    setupCardAbilities() {
        this.attachmentConditions({ myControl: true });

        this.whileAttached({
            condition: (context) => context.source.parent && context.source.controller.firstPlayer,
            effect: AbilityDsl.effects.modifyMilitarySkill(1)
        });

        this.whileAttached({
            effect: AbilityDsl.effects.gainAbility(AbilityTypes.Reaction, {
                title: 'Bow a character',
                when: {
                    onMoveToConflict: (event, context: TriggeredAbilityContext<DrawCard>) =>
                        context.source.isParticipating('military') &&
                        event.card.type === CardTypes.Character &&
                        event.card.isParticipating(),
                    onSendHome: (event, context) =>
                        context.source.isParticipating('military') &&
                        event.card.type === CardTypes.Character &&
                        !event.card.isParticipating()
                },
                target: {
                    cardType: CardTypes.Character,
                    cardCondition: (card, context) =>
                        card.isParticipating() && card.getMilitarySkill() < context.source.getMilitarySkill(),
                    gameAction: AbilityDsl.actions.bow()
                }
            } as TriggeredAbilityProps)
        });
    }
}