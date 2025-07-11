import AbilityHelper from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { AbilityRestriction } from '../../../core/Constants';

export default class OnTopOfThings extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '2012334456',
            internalName: 'on-top-of-things',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar) {
        registrar.addWhenPlayedAbility({
            title: 'Attached unit can not be attacked this phase',
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                target: context.source.parentCard,
                effect: AbilityHelper.ongoingEffects.cardCannot(AbilityRestriction.BeAttacked)
            }))
        });
    }
}
