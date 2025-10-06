import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, Trait, WildcardCardType, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class LamaSuWeModifiedTheirGenetics extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5244376854',
            internalName: 'lama-su#we-modified-their-genetics',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Play an upgrade from your hand on a friendly non-Vehicle unit. It costs 1 resource less. If you do, deal 1 damage to that unit.',
            cost: [abilityHelper.costs.exhaustSelf()],
            targetResolver: {
                // TODO remove cardTypeFilter but fix Choose nothing button before
                cardTypeFilter: WildcardCardType.Upgrade,
                zoneFilter: ZoneName.Hand,
                controller: RelativePlayer.Self,
                immediateEffect: abilityHelper.immediateEffects.playCardFromHand({
                    adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 1 },
                    playAsType: WildcardCardType.Upgrade,
                    attachTargetCondition: (target, context) => target.controller === context.player && !target.hasSomeTrait(Trait.Vehicle),
                }),
            },
            ifYouDo: (ifYouDoContext) => {
                return ({
                    title: 'Deal 1 damage to that unit',
                    immediateEffect: abilityHelper.immediateEffects.damage({
                        amount: 1,
                        target: ifYouDoContext.target.parentCard
                    })
                });
            },
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackCompletedAbility({
            title: 'Play an upgrade from your discard pile on a friendly non-Vehicle unit. It costs 1 resource less.',
            optional: true,
            targetResolver: {
                zoneFilter: ZoneName.Discard,
                controller: RelativePlayer.Self,
                immediateEffect: abilityHelper.immediateEffects.playCardFromOutOfPlay({
                    adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 1 },
                    playAsType: WildcardCardType.Upgrade,
                    canPlayFromAnyZone: true,
                    attachTargetCondition: (target, context) => target.controller === context.player && !target.hasSomeTrait(Trait.Vehicle),
                }),
            },
        });
    }
}