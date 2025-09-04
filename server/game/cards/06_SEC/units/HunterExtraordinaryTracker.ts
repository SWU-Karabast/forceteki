import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class HunterExtraordinaryTracker extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7027608849',
            internalName: 'hunter#extraordinary-tracker',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'If the defender is exhausted, it gets –4/–0 for this attack',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => {
                    return context.event.attack.targets.some((x) => x.isUnit() && x.exhausted);
                },
                onTrue: abilityHelper.immediateEffects.forThisAttackCardEffect((context) => ({
                    target: context.event.attack.targets.filter((x) => x.isUnit() && x.exhausted),
                    effect: abilityHelper.ongoingEffects.modifyStats({ power: -4, hp: 0 })
                }))
            }),
        });
    }
}
