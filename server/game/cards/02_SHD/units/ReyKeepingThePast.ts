import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { Aspect, WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelpers';

export default class ReyKeepingThePast extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0196346374',
            internalName: 'rey#keeping-the-past'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addIgnoreSpecificAspectPenaltyAbility({
            title: `While playing this unit, ignore her ${TextHelper.aspects(Aspect.Heroism)} aspect penalty if you control Kylo Ren`,
            ignoredAspect: Aspect.Heroism,
            condition: (context) => context.player.controlsLeaderUnitOrUpgradeWithTitle('Kylo Ren')
        });

        registrar.addOnAttackAbility({
            title: `You may heal 2 damage from a unit. If it's a non-${TextHelper.aspects(Aspect.Heroism)} unit, give a Shield token to it`,
            optional: true,
            targetResolver: {
                controller: WildcardRelativePlayer.Any,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.heal({ amount: 2 }),
                    AbilityHelper.immediateEffects.conditional({
                        condition: (context) => context.target.aspects.includes(Aspect.Heroism),
                        onFalse: AbilityHelper.immediateEffects.giveShield()
                    })
                ])
            },
        });
    }
}
