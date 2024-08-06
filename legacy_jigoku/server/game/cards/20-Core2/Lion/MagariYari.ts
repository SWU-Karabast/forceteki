import { AbilityTypes, CardTypes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';
import type { TriggeredAbilityProps } from '../../../Interfaces';

export default class MagariYari extends DrawCard {
    static id = 'magari-yari';

    setupCardAbilities() {
        this.whileAttached({
            match: (card: DrawCard) => card.hasTrait('bushi'),
            effect: AbilityDsl.effects.gainAbility(AbilityTypes.Reaction, {
                title: 'Bow a character',
                when: {
                    onMoveToConflict: (event, context) =>
                        (context.source as DrawCard).isParticipating('military') &&
                        event.card.type === CardTypes.Character &&
                        event.card.isParticipating() &&
                        event.card.getMilitarySkill() < context.source.getMilitarySkill()
                },
                gameAction: AbilityDsl.actions.bow((context) => ({ target: (context as any).event.card }))
            } as TriggeredAbilityProps)
        });
    }
}
