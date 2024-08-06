import AbilityDsl from '../../../abilitydsl';
import { CardTypes, Durations, TargetModes } from '../../../Constants';
import DrawCard from '../../../drawcard';

export default class ShinjoArcher extends DrawCard {
    static id = 'shinjo-archer';

    public setupCardAbilities() {
        this.action({
            title: 'Move and give -2/-2',
            condition: (context) => context.game.isDuringConflict(),
            cost: AbilityDsl.costs.switchLocation(),
            target: {
                mode: TargetModes.Single,
                cardType: CardTypes.Character,
                cardCondition: (card) => card.isParticipating(),
                gameAction: AbilityDsl.actions.cardLastingEffect({
                    effect: AbilityDsl.effects.modifyBothSkills(-2),
                    duration: Durations.UntilEndOfConflict
                })
            },
            effect: 'give {0} -2{2}/-2{3}',
            effectArgs: (context) => [context.source, 'military', 'political']
        });
    }
}
