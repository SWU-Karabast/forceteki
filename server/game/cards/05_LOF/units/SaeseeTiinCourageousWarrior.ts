import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode, WildcardCardType } from '../../../core/Constants';

export default class SaeseeTiinCourageousWarrior extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '7137948532',
            internalName: 'saesee-tiin#courageous-warrior',
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'If you have the initiative, deal 1 damage to each of up to 3 units',
            targetResolver: {
                mode: TargetMode.UpTo,
                canChooseNoCards: true,
                numCards: 3,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.hasInitiative(),
                    onTrue: AbilityHelper.immediateEffects.damage({ amount: 1 }),
                })
            }
        });
    }
}