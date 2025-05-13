import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import AbilityHelper from '../../../AbilityHelper';
import { WildcardCardType } from '../../../core/Constants';

export default class KarisWeDontLikeStrangers extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'karis#we-dont-like-strangers-id',
            internalName: 'karis#we-dont-like-strangers',
        };
    }

    public override setupCardAbilities() {
        this.addWhenDefeatedAbility({
            title: 'Use the Force',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.useTheForce(),
            ifYouDo: {
                title: 'Give a unit -2/-2 for this phase',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: -2, hp: -2 })
                    })
                }
            }
        });
    }
}