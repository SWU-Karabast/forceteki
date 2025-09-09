import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { KeywordName, RelativePlayer, TargetMode, WildcardCardType } from '../../../core/Constants';

export default class DedraMeeroNotWastingTime extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'dedra-meero#not-wasting-time-id',
            internalName: 'dedra-meero#not-wasting-time'
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Choose an enemy unit. Its controller may deal 2 damage to it. If they don\'t, draw a card.',
            cost: [abilityHelper.costs.abilityActivationResourceCost(1), abilityHelper.costs.exhaustSelf()],
            targetResolvers: {
                targetUnit: {
                    controller: RelativePlayer.Opponent,
                    cardTypeFilter: WildcardCardType.Unit
                },
                opponentsChoice: {
                    mode: TargetMode.Select,
                    dependsOn: 'targetUnit',
                    choosingPlayer: RelativePlayer.Opponent,
                    choices: (context) => ({
                        [`${context.targets.targetUnit.title} takes 2 damage`]: abilityHelper.immediateEffects.damage({
                            target: context.targets.targetUnit,
                            amount: 2
                        }),
                        ['Opponent draws 1 card']: abilityHelper.immediateEffects.draw({ amount: 1 })
                    })
                }
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While you have more cards in hand than an opponent, this unit gains Raid 2',
            condition: (context) => context.player.hand.length > context.player.opponent.hand.length,
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 2 })
        });
    }
}
