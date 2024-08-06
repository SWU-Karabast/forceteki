import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class Pacifism extends DrawCard {
    static id = 'pacifism';

    setupCardAbilities() {
        this.whileAttached({
            effect: [
                AbilityDsl.effects.cannotParticipateAsAttacker('military'),
                AbilityDsl.effects.cannotParticipateAsDefender('military')
            ]
        });
    }
}
