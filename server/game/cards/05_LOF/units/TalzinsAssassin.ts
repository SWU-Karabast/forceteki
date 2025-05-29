import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class TalzinsAssassin extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2410965424',
            internalName: 'talzins-assassin',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Use the Force to give a unit -3/-3 for this phase',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.useTheForce(),
            ifYouDo: {
                title: 'Give a unit -3/-3 for this phase',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: -3, hp: -3 })
                    })
                }
            }
        });
    }
}

