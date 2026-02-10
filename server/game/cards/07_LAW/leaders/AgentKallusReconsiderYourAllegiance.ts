import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { Aspect, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class AgentKallusReconsiderYourAllegiance extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9236732601',
            internalName: 'agent-kallus#reconsider-your-allegiance',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Play a card from your hand, ignoring its aspect penalties',
            cost: [abilityHelper.costs.abilityActivationResourceCost(1), abilityHelper.costs.exhaustSelf()],
            targetResolver: {
                zoneFilter: ZoneName.Hand,
                controller: RelativePlayer.Self,
                // TODO remove cardTypeFilter but fix Choose nothing button before
                cardTypeFilter: WildcardCardType.Playable,
                immediateEffect: abilityHelper.immediateEffects.playCardFromHand({
                    playAsType: WildcardCardType.Any,
                    adjustCost: { costAdjustType: CostAdjustType.IgnoreAllAspects },
                })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Play a card from your hand, ignoring its aspect penalties',
            cost: [abilityHelper.costs.abilityActivationResourceCost(1)],
            targetResolver: {
                zoneFilter: ZoneName.Hand,
                controller: RelativePlayer.Self,
                // TODO remove cardTypeFilter but fix Choose nothing button before
                cardTypeFilter: WildcardCardType.Playable,
                immediateEffect: abilityHelper.immediateEffects.playCardFromHand({
                    playAsType: WildcardCardType.Any,
                    adjustCost: { costAdjustType: CostAdjustType.IgnoreAllAspects },
                })
            }
        });

        registrar.addTriggeredAbility({
            title: 'Heal 2 damage from your base',
            when: {
                onCardPlayed: (event, context) => event.card.hasSomeAspect(Aspect.Heroism) && event.player === context.player,
            },
            immediateEffect: abilityHelper.immediateEffects.heal((context) => ({
                amount: 2,
                target: context.player.base,
            }))
        });
    }
}
