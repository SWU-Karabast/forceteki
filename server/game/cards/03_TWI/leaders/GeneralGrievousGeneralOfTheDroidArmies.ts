import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { KeywordName, Trait, WildcardCardType } from '../../../core/Constants';

export default class GeneralGrievousGeneralOfTheDroidArmies extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2872203891',
            internalName: 'general-grievous#general-of-the-droid-armies',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Give a Droid unit Sentinel for this phase',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.hasSomeTrait(Trait.Droid),
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Sentinel })
                })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Give a Droid unit +1/+0 and Sentinel for this phase',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.hasSomeTrait(Trait.Droid),
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: [
                        AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 }),
                        AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Sentinel })
                    ]
                })
            }
        });
    }
}
