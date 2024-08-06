import AbilityDsl from '../../../abilitydsl';
import type BaseCard from '../../../basecard';
import { AbilityTypes, CardTypes, Players, TargetModes } from '../../../Constants';
import DrawCard from '../../../drawcard';
import type { ActionProps } from '../../../Interfaces';

export default class WritOfSurvey extends DrawCard {
    static id = 'writ-of-survey';

    public setupCardAbilities() {
        this.attachmentConditions({
            limitTrait: { title: 1 }
        });

        this.persistentEffect({
            condition: (context) => context.source.parent.isHonored,
            effect: AbilityDsl.effects.addKeyword('ancestral')
        });

        this.whileAttached({
            effect: AbilityDsl.effects.gainAbility(AbilityTypes.Action, {
                title: 'Bow a participating dishonored character',
                condition: (context) => context.source.isParticipating(),
                target: {
                    cardType: CardTypes.Character,
                    controller: Players.Any,
                    mode: TargetModes.Single,
                    cardCondition: (card) => card.isParticipating() && card.isDishonored,
                    gameAction: AbilityDsl.actions.bow()
                }
            } as ActionProps<this>)
        });
    }

    public canPlayOn(source: BaseCard): boolean {
        return source.isHonored && super.canPlayOn(source);
    }
}
