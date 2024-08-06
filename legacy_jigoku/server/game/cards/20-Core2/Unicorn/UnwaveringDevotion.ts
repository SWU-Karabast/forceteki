import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class UnwaveringDevotion extends DrawCard {
    static id = 'unwavering-devotion';

    setupCardAbilities() {
        this.persistentEffect({
            match: (card, context) => card === context.source.parent,
            effect: AbilityDsl.effects.modifyGlory(1)
        });

        this.persistentEffect({
            match: (card, context) => card === context.source.parent,
            effect: AbilityDsl.effects.cardCannot({
                cannot: 'target',
                restricts: 'opponentsCharacterAbilitiesWithLowerGlory'
            })
        });
    }
}