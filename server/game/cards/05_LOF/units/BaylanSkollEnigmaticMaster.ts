import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';

export default class BaylanSkollEnigmaticMaster extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'baylan-skoll#enigmatic-master-id',
            internalName: 'baylan-skoll#enigmatic-master',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addWhenPlayedAbility({
            title: 'Use the Force to return a non-leader unit that costs 4 or less to its owner\'s hand',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.useTheForce(),
            ifYouDo: {
                title: 'Return a non-leader unit that costs 4 or less to its owner\'s hand',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.NonLeaderUnit,
                    cardCondition: (card) => card.isNonLeaderUnit() && card.cost <= 4,
                    immediateEffect: AbilityHelper.immediateEffects.returnToHand()
                },
                then: (thenContext) => ({
                    title: `Play ${thenContext.target?.title} for free`,
                    optional: true,
                    canBeTriggeredBy: EnumHelpers.asRelativePlayer(thenContext.player, thenContext.target?.controller),
                    immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({
                        target: thenContext.target,
                        playAsType: WildcardCardType.Unit,
                        adjustCost: {
                            costAdjustType: CostAdjustType.Free
                        }
                    })
                })
            }
        });
    }
}