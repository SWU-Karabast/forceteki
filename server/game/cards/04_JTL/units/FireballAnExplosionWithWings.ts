import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { PhaseName } from '../../../core/Constants';

export default class FireballAnExplosionWithWings extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4240570958',
            internalName: 'fireball#an-explosion-with-wings',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Deal 1 damage to this unit.',
            when: {
                onPhaseStarted: (context) => context.phase === PhaseName.Regroup
            },
            immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 }),
        });
    }
}
