import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer } from '../../../core/Constants';

export default class LomPykeDealerInTruths extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5632569775',
            internalName: 'lom-pyke#dealer-in-truths',
        };
    }

    public override setupCardAbilities() {
        this.addOnAttackAbility({
            title: 'Give a Shield token to an enemy unit',
            optional: true,
            targetResolver: {
                controller: RelativePlayer.Opponent,
                immediateEffect: AbilityHelper.immediateEffects.giveShield()
            },
            ifYouDo: {
                title: 'Give a Shield token to a friendly unit',
                targetResolver: {
                    controller: RelativePlayer.Self,
                    immediateEffect: AbilityHelper.immediateEffects.giveShield()
                }
            }
        });
    }
}
