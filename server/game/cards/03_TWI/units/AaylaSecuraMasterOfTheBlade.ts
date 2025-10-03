import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, DamagePreventionType } from '../../../core/Constants';
import { DamageSourceType } from '../../../IDamageOrDefeatSource';

export default class AaylaSecuraMasterOfTheBlade extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6190335038',
            internalName: 'aayla-secura#master-of-the-blade',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addCoordinateAbility({
            type: AbilityType.Triggered,
            title: 'Prevent all combat damage that would be dealt to this unit for this attack.',
            when: {
                onAttack: true,
            },
            immediateEffect: AbilityHelper.immediateEffects.forThisAttackCardEffect((context) => ({
                target: context.source,
                effect: AbilityHelper.ongoingEffects.gainDamagePreventionAbility({
                    title: 'Prevent all combat damage that would be dealt to this unit',
                    type: AbilityType.DamagePrevention,
                    preventionType: DamagePreventionType.All,
                    preventDamageFrom: DamageSourceType.Attack
                }),
            })),
        });
    }
}
