import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class DirectorKrennicArchitectOfAnnihilation extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'director-krennic#architect-of-annihilation-id',
            internalName: 'director-krennic#architect-of-annihilation',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: `Play a unit that costs 7 or less from your hand. It costs ${TextHelper.resource(2)} less`,
            cost: [abilityHelper.costs.exhaustSelf()],
            cannotTargetFirst: true,
            targetResolver: {
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                cardCondition: (card) => card.isUnit() && card.cost <= 7,
                immediateEffect: abilityHelper.immediateEffects.playCardFromHand({
                    adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 2 },
                    playAsType: WildcardCardType.Unit
                }),
            }
        });
    }
}