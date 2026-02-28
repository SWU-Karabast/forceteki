import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, ZoneName } from '../../../core/Constants';

export default class DoggedPursuers extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8976669004',
            internalName: 'dogged-pursuers',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Pay 1 resource to deal 2 damage to a ground unit',
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.payResources((context) => ({ amount: 1, target: context.player })),
            ifYouDo: {
                title: 'Deal 2 damage to a ground unit',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: ZoneName.GroundArena,
                    immediateEffect: abilityHelper.immediateEffects.damage({ amount: 2 })
                }
            }
        });
    }
}