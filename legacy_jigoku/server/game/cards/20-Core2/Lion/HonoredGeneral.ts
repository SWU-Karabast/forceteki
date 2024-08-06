import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class HonoredGeneral extends DrawCard {
    static id = 'honored-general';

    setupCardAbilities() {
        this.persistentEffect({
            condition: (context) => context.source.isParticipating(),
            match: (card, context) => card.isParticipating() && card.isFaction('lion') && card !== context.source,
            effect: AbilityDsl.effects.modifyMilitarySkill(1)
        });

        this.reaction({
            title: 'Honor this character',
            when: {
                onCharacterEntersPlay: (event, context) => event.card === context.source
            },
            gameAction: AbilityDsl.actions.honor()
        });
    }
}
