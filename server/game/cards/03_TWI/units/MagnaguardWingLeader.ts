import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

export default class MagnaguardWingLeader extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5630404651',
            internalName: 'magnaguard-wing-leader',
        };
    }

    public override setupCardAbilities() {
        this.addActionAbility({
            title: 'Attack with a Droid unit',
            limit: AbilityHelper.limit.perRound(1),
            targetResolver: {
                activePromptTitle: 'Choose a Droid unit',
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.hasSomeTrait(Trait.Droid),
                immediateEffect: AbilityHelper.immediateEffects.attack(),
            },
            then: (thenContext) => ({
                title: 'Attack with another Droid unit',
                targetResolver: {
                    activePromptTitle: 'Choose a Droid unit',
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                    cardCondition: (card) => card.hasSomeTrait(Trait.Droid) && card !== thenContext.target,
                    immediateEffect: AbilityHelper.immediateEffects.attack(),
                }
            })
        });
    }
}

MagnaguardWingLeader.implemented = true;
