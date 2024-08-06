import AbilityDsl from '../../../abilitydsl';
import { CardTypes } from '../../../Constants';
import DrawCard from '../../../drawcard';

export default class TravelingTinkerer extends DrawCard {
    static id = 'traveling-tinkerer';

    setupCardAbilities() {
        this.action({
            title: 'Flip the modifiers of an attachment',
            condition: (context) => context.game.isDuringConflict(),
            target: {
                cardType: CardTypes.Attachment,
                gameAction: AbilityDsl.actions.cardLastingEffect({
                    effect: AbilityDsl.effects.switchAttachmentSkillModifiers()
                })
            },
            effect: 'switch the skill modifiers of {0}'
        });
    }
}