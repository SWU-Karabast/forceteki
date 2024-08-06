import AbilityDsl from '../../abilitydsl';
import { AbilityTypes, CardTypes } from '../../Constants';
import DrawCard from '../../drawcard';

export default class ContemplativeWisdom extends DrawCard {
    static id = 'contemplative-wisdom';

    setupCardAbilities() {
        this.whileAttached({
            effect: AbilityDsl.effects.gainAbility(AbilityTypes.Action, {
                title: 'Give all abilities to another character',
                condition: (context) => context.game.isDuringConflict(),
                cost: AbilityDsl.costs.returnRings(1),
                target: {
                    cardType: CardTypes.Character,
                    cardCondition: (card) => card.isParticipating(),
                    gameAction: AbilityDsl.actions.cardLastingEffect((context) => ({
                        effect: AbilityDsl.effects.gainAllAbilities(context.source)
                    }))
                },
                effect: 'give {0} all the printed abilities of {1}',
                effectArgs: (context) => [context.source],
                printedAbility: false
            })
        });
    }
}
