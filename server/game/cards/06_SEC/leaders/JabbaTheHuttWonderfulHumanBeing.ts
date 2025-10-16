import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class JabbaTheHuttWonderfulHumanBeing extends LeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: 'jabba-the-hutt#wonderful-human-being-id',
            internalName: 'jabba-the-hutt#wonderful-human-being'
        };
    }

    protected override setupLeaderSideAbilities (registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'A friendly damaged unit deals 1 damage to an enemy unit. If the friendly unit has 3 or more damage on it, it deals 2 damage instead',
            cost: [abilityHelper.costs.abilityActivationResourceCost(1), abilityHelper.costs.exhaustSelf()],
            targetResolvers: {
                friendlyUnit: {
                    controller: RelativePlayer.Self,
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card) => card.isUnit() && card.damage > 0
                },
                opponentUnit: {
                    controller: RelativePlayer.Opponent,
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: abilityHelper.immediateEffects.damage((context) => ({
                        amount: context.targets.friendlyUnit.damage >= 3 ? 2 : 1,
                        target: context.targets.opponentUnit,
                        source: context.targets.friendlyUnit,
                    }))
                }
            },
            effect: 'deal {2} damage to {3} with {1}',
            effectArgs: (context) => [context.targets.friendlyUnit, context.targets.friendlyUnit.damage >= 3 ? 2 : 1, context.targets.opponentUnit]
        });
    }

    protected override setupLeaderUnitSideAbilities (registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'That unit deals that much damage to an enemy unit',
            when: {
                onDamageDealt: (event, context) =>
                    !event.willDefeat &&
                    event.card.isUnit() &&
                    event.card !== context.source &&
                    event.card.controller === context.player
            },
            optional: true,
            limit: abilityHelper.limit.perRound(1),
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.damage((context) => ({
                    amount: context.event.amount,
                    source: context.event.card
                }))
            }
        });
    }
}
