import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, KeywordName, WildcardCardType } from '../../../core/Constants';
import * as Helpers from '../../../core/utils/Helpers';

export default class B2EMOThatsTwoLies extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5030756090',
            internalName: 'b2emo#thats-two-lies',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        const aspects = [Aspect.Heroism, Aspect.Heroism];

        registrar.addOnAttackAbility({
            title: `Disclose ${Helpers.aspectString(aspects)} to give a unit Sentinel for this phase`,
            immediateEffect: abilityHelper.immediateEffects.disclose({ aspects }),
            ifYouDo: {
                title: 'Give a unit Sentinel for this phase',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
                    })
                }
            }
        });
    }
}
