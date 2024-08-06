import AbilityDsl from '../../../abilitydsl';
import { AbilityTypes, CardTypes, Players } from '../../../Constants';
import DrawCard from '../../../drawcard';
import type { ActionProps } from '../../../Interfaces';

export default class KagiNawa extends DrawCard {
    static id = 'kagi-nawa';

    setupCardAbilities() {
        this.whileAttached({
            match: (card) => card.hasTrait('shinobi'),
            effect: AbilityDsl.effects.gainAbility(AbilityTypes.Action, {
                title: 'Move a character to the conflict',
                condition: (context) => context.source.isParticipating(),
                target: {
                    cardType: CardTypes.Character,
                    controller: Players.Any,
                    activePromptTitle: 'Choose a character with printed cost 2 or lower to move in',
                    cardCondition: (card) => !card.isParticipating() && card.printedCost <= 2,
                    gameAction: AbilityDsl.actions.moveToConflict()
                },
                effect: 'hook {0} and drag them into the conflict'
            } as ActionProps<this>)
        });
    }
}