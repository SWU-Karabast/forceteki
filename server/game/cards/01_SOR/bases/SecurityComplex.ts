import { BaseCard } from '../../../core/card/BaseCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { WildcardCardType } from '../../../core/Constants';
import type { IBaseAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class SecurityComplex extends BaseCard {
    protected override getImplementationId () {
        return {
            id: '2429341052',
            internalName: 'security-complex',
        };
    }

    public override setupCardAbilities(registrar: IBaseAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEpicActionAbility({
            title: 'Give a Shield token to a non-leader unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                immediateEffect: AbilityHelper.immediateEffects.giveShield()
            }
        });
    }
}
