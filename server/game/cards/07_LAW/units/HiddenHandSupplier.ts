import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class HiddenHandSupplier extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1514592160',
            internalName: 'hidden-hand-supplier',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Pay 1 resource to give an Experience token to another unit',
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.payResources((context) => ({ amount: 1, target: context.player })),
            ifYouDo: {
                title: 'Give an Experience token to another unit',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card, context) => card !== context.source,
                    immediateEffect: abilityHelper.immediateEffects.giveExperience()
                }
            }
        });
    }
}