import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class DilapidatedSkiSpeeder extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5012301077',
            internalName: 'dilapidated-ski-speeder'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Deal 3 damage to this unit',
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                target: context.source,
                amount: 3,
            }))
        });
    }
}