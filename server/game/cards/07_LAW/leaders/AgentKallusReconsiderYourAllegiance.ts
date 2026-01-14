import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { Aspect, WildcardCardType } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class AgentKallusReconsiderYourAllegiance extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'agent-kallus#reconsider-your-allegiance-id',
            internalName: 'agent-kallus#reconsider-your-allegiance',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Play a card from your hand, ignoring its aspect penalties',
            cost: [AbilityHelper.costs.abilityActivationResourceCost(1), AbilityHelper.costs.exhaustSelf()],
            immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({
                playAsType: WildcardCardType.Any,
                adjustCost: { costAdjustType: CostAdjustType.IgnoreAllAspects },
            })
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Play a card from your hand, ignoring its aspect penalties',
            cost: [AbilityHelper.costs.abilityActivationResourceCost(1)],
            immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({
                playAsType: WildcardCardType.Any,
                adjustCost: { costAdjustType: CostAdjustType.IgnoreAllAspects },
            })
        });

        registrar.addTriggeredAbility({
            title: 'Heal 2 damage from your base',
            when: {
                onCardPlayed: (event, context) => event.card.hasSomeAspect(Aspect.Heroism) && event.player === context.player,
            },
            immediateEffect: AbilityHelper.immediateEffects.heal((context) => ({
                amount: 2,
                target: context.player.base,
            }))
        });
    }
}
