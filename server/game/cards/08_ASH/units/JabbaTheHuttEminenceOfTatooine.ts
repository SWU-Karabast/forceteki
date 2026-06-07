import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class JabbaTheHuttEminenceOfTatooine extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7317430733',
            internalName: 'jabba-the-hutt#eminence-of-tatooine',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Return an upgrade to its owner\'s hand. If it\'s returned to your hand, you may play it for free',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Upgrade,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            },
            then: (thenContext) => ({
                title: `Play ${thenContext.target?.title} for free`,
                thenCondition: () => thenContext.player === thenContext.target?.owner,
                optional: true,
                immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({
                    target: thenContext.target,
                    playAsType: WildcardCardType.Upgrade,
                    adjustCost: {
                        costAdjustType: CostAdjustType.Free,
                    }
                })
            })
        });
    }
}