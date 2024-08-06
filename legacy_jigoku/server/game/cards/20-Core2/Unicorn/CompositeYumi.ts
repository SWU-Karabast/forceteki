import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class CompositeYumi extends DrawCard {
    static id = 'composite-yumi';

    setupCardAbilities() {
        this.reaction({
            title: 'Give attached character +1/+0',
            when: {
                onMoveToConflict: (event, context) => context.source.parent,
                onSendHome: (event, context) => context.source.parent,
                onCharacterEntersPlay: (event, context) => context.source.parent && context.game.isDuringConflict(),
                onCreateTokenCharacter: (event, context) =>
                    context.source.parent && event.tokenCharacter?.isParticipating()
            },
            gameAction: AbilityDsl.actions.cardLastingEffect((context) => ({
                target: context.source.parent,
                effect: AbilityDsl.effects.modifyMilitarySkill(1)
            })),
            effect: 'give +1{1} to {2}',
            effectArgs: (context) => ['military', context.source.parent],
            limit: AbilityDsl.limit.unlimitedPerConflict()
        });
    }
}
