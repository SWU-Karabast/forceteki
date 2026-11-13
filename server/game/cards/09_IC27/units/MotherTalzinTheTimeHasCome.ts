import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, RelativePlayer, Trait, WildcardCardType, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class MotherTalzinTheTimeHasCome extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7414147681',
            internalName: 'mother-talzin#the-time-has-come',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: `Play a ${TextHelper.Villainy} unit that costs 4 or less from your discard pile for free. If it's not a ${TextHelper.Trait.Night} or ${TextHelper.Trait.Undead} unit, deal damage equal to its cost to this unit`,
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.Discard,
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.isUnit() && card.hasSomeAspect(Aspect.Villainy) && card.cost <= 4,
                immediateEffect: abilityHelper.immediateEffects.playCardFromOutOfPlay({
                    adjustCost: { costAdjustType: CostAdjustType.Free },
                    playAsType: WildcardCardType.Unit,
                })
            },
            ifYouDo: (ifYouDoContext) => ({
                title: `Deal ${ifYouDoContext.events[0].card.cost} damage to this unit`,
                ifYouDoCondition: () => !ifYouDoContext.events[0].card.hasSomeTrait([Trait.Night, Trait.Undead]),
                immediateEffect: abilityHelper.immediateEffects.damage({
                    amount: ifYouDoContext.events[0].card.cost,
                    target: ifYouDoContext.source,
                })
            })
        });
    }
}
