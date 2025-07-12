import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait, WildcardCardType, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class CinDralligEsteemedBlademaster extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7787879864',
            internalName: 'cin-drallig#esteemed-blademaster',
        };
    }

    protected override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'You may play a Lightsaber upgrade from your hand for free on this unit',
            targetResolver: {
                zoneFilter: ZoneName.Hand,
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.isUpgrade() && card.hasSomeTrait(Trait.Lightsaber),
                immediateEffect: AbilityHelper.immediateEffects.playCardFromHand((context) => ({
                    adjustCost: { costAdjustType: CostAdjustType.Free },
                    playAsType: WildcardCardType.Upgrade,
                    attachTargetCondition: (attachTarget) => attachTarget === context.source
                }))
            },
            ifYouDo: {
                title: 'Ready him',
                immediateEffect: AbilityHelper.immediateEffects.ready(),
            }
        });
    }
}