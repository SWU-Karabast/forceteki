import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect } from '../../../core/Constants';

export default class DistantPatroller extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '8333567388',
            internalName: 'distant-patroller'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Give a Shield token to a Vigilance unit',
            optional: true,
            targetResolver: {
                cardCondition: (card) => card.isUnit() && card.hasSomeAspect(Aspect.Vigilance),
                immediateEffect: AbilityHelper.immediateEffects.giveShield()
            }
        });
    }
}
