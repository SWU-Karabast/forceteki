import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class ArvelSkeenWinAndWalkAway extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'arvel-skeen#win-and-walk-away-id',
            internalName: 'arvel-skeen#win-and-walk-away',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Defeat a Credit token',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Token,
                cardCondition: (card) => card.isCreditToken(),
                immediateEffect: AbilityHelper.immediateEffects.defeat(),
            },
            ifYouDo: {
                title: 'Deal 1 damage to a unit or base',
                targetResolver: {
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
                }
            }
        });
        registrar.addOnAttackAbility({
            title: 'Defeat a Credit token',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Token,
                cardCondition: (card) => card.isCreditToken(),
                immediateEffect: AbilityHelper.immediateEffects.defeat(),
            },
            ifYouDo: {
                title: 'Deal 1 damage to a unit or base',
                targetResolver: {
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
                }
            }
        });
    }
}