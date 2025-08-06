import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class OuterRimHeadhunter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3613174521',
            internalName: 'outer-rim-headhunter'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Exhaust a non-leader unit if you control a leader unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.leader.isDeployableLeader() && context.player.leader.deployed,
                    onTrue: AbilityHelper.immediateEffects.exhaust(),
                })
            }
        });
    }
}
