import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';
import { KeywordName, WildcardCardType } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class RioDurantBeckettsRightHands extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'rio-durant#becketts-right-hands-id',
            internalName: 'rio-durant#becketts-right-hands',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Return a non-leader unit that costs 3 or less to its owner\'s hand',
            optional: true,
            targetResolver: {
                cardCondition: (card) => card.isNonLeaderUnit() && card.cost <= 3,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            },
            then: (thenContext) => ({
                thenCondition: () => thenContext.target,
                title: `Play ${thenContext.target?.title} for free. It gains Shielded for this phase`,
                optional: true,
                // TODO: Update this to use a GameSystem that lets the opponent play a card
                canBeTriggeredBy: EnumHelpers.asRelativePlayer(thenContext.player, thenContext.target?.owner),
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Shielded),
                        target: thenContext.target
                    }),
                    AbilityHelper.immediateEffects.playCardFromHand({
                        target: thenContext.target,
                        playAsType: WildcardCardType.Unit,
                        adjustCost: {
                            costAdjustType: CostAdjustType.Free,
                        }
                    })
                ])
            })
        });
    }
}
