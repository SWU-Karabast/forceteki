import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName, WildcardCardType } from '../../../core/Constants';

export default class BobaFettForAPrice extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2562671677',
            internalName: 'boba-fett#for-a-price'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Pay 1 to deal 3 damage to a ground unit',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.payResources((context) => ({
                amount: 1,
                target: context.player
            })),
            ifYouDo: {
                title: 'Deal 3 damage to a ground unit',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: ZoneName.GroundArena,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 3 })
                }
            }
        });

        registrar.addOnAttackAbility({
            title: 'Pay 1 to deal 3 damage to a ground unit',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.payResources((context) => ({
                amount: 1,
                target: context.player
            })),
            ifYouDo: {
                title: 'Deal 3 damage to a ground unit',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: ZoneName.GroundArena,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 3 })
                }
            }
        });
    }
}