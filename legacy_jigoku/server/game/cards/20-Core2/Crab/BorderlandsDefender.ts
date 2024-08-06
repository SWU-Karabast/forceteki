import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class BorderlandsDefender extends DrawCard {
    static id = 'borderlands-defender';

    setupCardAbilities() {
        this.persistentEffect({
            condition: (context) => context.source.isDefending(),
            effect: [
                AbilityDsl.effects.cardCannot({
                    cannot: 'sendHome',
                    restricts: 'opponentsCardEffects'
                }),
                AbilityDsl.effects.cardCannot({
                    cannot: 'bow',
                    restricts: 'opponentsCardEffects'
                })
            ]
        });
    }
}
