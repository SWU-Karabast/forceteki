import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

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
                cardTypeFilter: WildcardCardType.Unit,
                activePromptTitle: (context) => `Choose a unit to deal ${context.player.hand.length} damage`,
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                    amount: context.player.hand.length
                }))
            }
        });
    }
}