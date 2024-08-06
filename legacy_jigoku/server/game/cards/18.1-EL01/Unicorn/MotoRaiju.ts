import type { AbilityContext } from '../../../AbilityContext';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

function bonus(context: AbilityContext): number {
    return context.player.getNumberOfOpponentsFaceupProvinces();
}

export default class MotoRaiju extends DrawCard {
    static id = 'moto-raiju';

    setupCardAbilities() {
        this.action({
            title: 'Get a military skill bonus',
            condition: (context) => context.source.isParticipating(),
            gameAction: AbilityDsl.actions.cardLastingEffect((context) => ({
                target: context.source,
                effect: AbilityDsl.effects.modifyMilitarySkill(bonus(context))
            })),
            effect: 'give itself +{1}{2} until the end of the conflict',
            effectArgs: (context) => [bonus(context), 'military']
        });
    }
}
