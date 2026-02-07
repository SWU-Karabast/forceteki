import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType } from '../../../core/Constants';

export default class DefiantHammerhead extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'defiant-hammerhead-id',
            internalName: 'defiant-hammerhead',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'If this unit is attacking a unit, you may give it +4/+0',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.conditional(({
                condition: (context) => context.event.attack.targetIsUnit(),
                onTrue: AbilityHelper.immediateEffects.forThisAttackCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 4, hp: 0 })
                }),
            })),
            ifYouDo: {
                title: 'Defeat this unit after completing this attack',
                immediateEffect: AbilityHelper.immediateEffects.forThisAttackCardEffect({
                    effect: AbilityHelper.ongoingEffects.gainAbility({
                        type: AbilityType.Triggered,
                        title: 'Defeat Defiant Hammerhead',
                        when: {
                            onAttackCompleted: () => true,
                        },
                        immediateEffect: AbilityHelper.immediateEffects.defeat(),
                    })
                })
            }
        });
    }
}