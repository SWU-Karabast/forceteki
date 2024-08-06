import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class RogueUnderstudy extends DrawCard {
    static id = 'rogue-understudy';

    setupCardAbilities() {
        this.action({
            title: 'Lose 1 honor to ready me',
            cost: AbilityDsl.costs.payHonor(1),
            gameAction: AbilityDsl.actions.ready()
        });
    }
}
