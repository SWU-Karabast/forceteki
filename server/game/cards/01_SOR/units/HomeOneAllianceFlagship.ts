import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, KeywordName, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class HomeOneAllianceFlagship extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '4919000710',
            internalName: 'home-one#alliance-flagship',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Play a Heroism unit from your discard pile. It costs 3 less',
            targetResolver: {
                cardCondition: (card) => card.isUnit() && card.hasSomeAspect(Aspect.Heroism),
                zoneFilter: ZoneName.Discard,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.playCardFromOutOfPlay({
                    adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 3 },
                    playAsType: WildcardCardType.Unit
                }),
            }
        });

        registrar.addConstantAbility({
            title: 'Each other friendly unit gains Restore 1.',
            matchTarget: (card, context) => card.isUnit() && card.controller === context.player && card !== context.source,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Restore, amount: 1 })
        });
    }
}
