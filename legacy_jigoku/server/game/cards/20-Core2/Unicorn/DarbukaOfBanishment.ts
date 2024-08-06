import { Players, TargetModes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class DarbukaOfBanishment extends DrawCard {
    static id = 'darbuka-of-banishment';

    setupCardAbilities() {
        this.persistentEffect({
            targetController: Players.Opponent,
            effect: AbilityDsl.effects.playerCannot({
                cannot: 'haveAffinity',
                restricts: 'unlessMeishodo'
            })
        });

        this.action({
            title: 'Return a ring to the unclaimed pool',
            cost: AbilityDsl.costs.payHonor(1),
            target: {
                mode: TargetModes.Ring,
                ringCondition: (ring) => ring.isClaimed(),
                gameAction: AbilityDsl.actions.returnRing()
            }
        });
    }
}
