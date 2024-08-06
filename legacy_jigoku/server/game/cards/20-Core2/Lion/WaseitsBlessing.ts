import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class WaseitsBlessing extends DrawCard {
    static id = 'waseit-s-blessing';

    setupCardAbilities() {
        this.action({
            title: 'Send a character home from each side',
            targets: {
                myCharacter: {
                    cardCondition: (card) => card.isDefending(),
                    gameAction: AbilityDsl.actions.sendHome()
                },
                oppCharacter: {
                    dependsOn: 'myCharacter',
                    cardCondition: (card) => card.isAttacking(),
                    gameAction: AbilityDsl.actions.sendHome()
                }
            },
            effect: 'send home {1} and {2}',
            effectArgs: (context) => [context.targets.myCharacter, context.targets.oppCharacter],
            max: AbilityDsl.limit.perRound(1)
        });
    }
}
