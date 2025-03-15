import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';

export default class RebelliousHammerhead extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '5540797366',
            internalName: 'rebellious-hammerhead',
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'Deal damage to a unit equal to the number of cards in your hand',
            optional: true,
            targetResolver: {
                controller: WildcardRelativePlayer.Any,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                    amount: context.player.hand.length
                }))
            }
        });
    }
}