import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';

export default class AhsokaTanoChasingWhispers extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '3388566378',
            internalName: 'ahsoka-tano#chasing-whispers',
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'An opponent discards a card from their hand. If it\'s a unit, you may exhaust a unit.',
            immediateEffect: AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                amount: 1,
                target: context.player.opponent
            })),
            ifYouDo: (ifYouDoContext) => ({
                title: 'Exhaust a unit',
                ifYouDoCondition: () => EnumHelpers.isUnit(ifYouDoContext.events[0]?.card?.type),
                optional: true,
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.exhaust()
                }
            })
        });
    }
}
