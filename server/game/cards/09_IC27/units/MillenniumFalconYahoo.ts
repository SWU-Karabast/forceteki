import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { TextHelper } from '../../../core/utils/TextHelper';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class MillenniumFalconYahoo extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'millennium-falcon#yahoo-id',
            internalName: 'millennium-falcon#yahoo',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenAttackEndsAbility({
            title: `You may pay ${TextHelper.resource(1)}. If you do, return a friendly unit that costs 3 or less to its owner's hand. If it's returned to your hand. you may play it for free.`,
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (c) => c.player.hasSomeArenaUnit({ condition: (c) => c.hasCost() && c.cost <= 3 }),
                onTrue: abilityHelper.immediateEffects.payResources((context) => ({ amount: 1, target: context.player })),
            }),
            ifYouDo: {
                title: 'Return a friendly unit that costs 3 or less to its owner\'s hand. If it\'s returned to your hand. you may play it for free',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                    cardCondition: (card) => card.hasCost() && card.cost <= 3,
                    immediateEffect: abilityHelper.immediateEffects.returnToHand(),
                },
                then: (thenContext) => ({
                    thenCondition: () => thenContext.player === thenContext.target?.owner,
                    title: `Play ${thenContext.target?.title} for free`,
                    optional: true,
                    immediateEffect: abilityHelper.immediateEffects.playCardFromHand({
                        target: thenContext.target,
                        playAsType: WildcardCardType.Unit,
                        adjustCost: {
                            costAdjustType: CostAdjustType.Free,
                        }
                    })
                })
            }
        });
    }
}