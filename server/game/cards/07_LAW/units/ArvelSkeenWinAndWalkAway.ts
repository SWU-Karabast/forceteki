import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class ArvelSkeenWinAndWalkAway extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5253255222',
            internalName: 'arvel-skeen#win-and-walk-away',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Defeat a Credit token',
            when: {
                onAttack: true,
                whenPlayed: true,
            },
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