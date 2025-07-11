import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class JedhaAgitator extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1746195484',
            internalName: 'jedha-agitator',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addOnAttackAbility({
            title: 'If you control a leader unit, deal 2 damage to a ground unit or base',
            targetResolver: {
                cardCondition: (card) => (card.isUnit() && card.zoneName === ZoneName.GroundArena) || card.isBase(),
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.leader.isDeployableLeader() && context.player.leader.deployed,
                    onTrue: AbilityHelper.immediateEffects.damage({ amount: 2 }),
                })
            }
        });
    }
}
