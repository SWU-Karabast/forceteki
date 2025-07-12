import type { IAbilityHelper } from '../../../AbilityHelper';
import { BaseCard } from '../../../core/card/BaseCard';
import type { IBaseAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class TombOfEilram extends BaseCard {
    protected override getImplementationId () {
        return {
            id: '2699176260',
            internalName: 'tomb-of-eilram',
        };
    }

    public override setupCardAbilities(registrar: IBaseAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'The Force is with you',
            cost: AbilityHelper.costs.exhaustFriendlyUnit(),
            immediateEffect: AbilityHelper.immediateEffects.theForceIsWithYou()
        });
    }
}
