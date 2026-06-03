import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class JustifierRelentless extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '9490691949',
            internalName: 'justifier#relentless',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Deal 1 damage to a unit',
            when: {
                whenPlayed: true,
                onAttack: true,
            },
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.damage({ amount: 1 })
            },
            ifYouDo: {
                title: 'Give an Advantage token to a unit',
                ifYouDoCondition: (ifYouDoContext) => ifYouDoContext.resolvedEvents[0].willDefeat,
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: abilityHelper.immediateEffects.giveAdvantage()
                }
            }
        });
    }
}