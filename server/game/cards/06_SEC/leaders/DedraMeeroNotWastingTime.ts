import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { KeywordName, NamedAction, RelativePlayer, TargetMode, WildcardCardType } from '../../../core/Constants';

export default class DedraMeeroNotWastingTime extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0955276339',
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
                    mode: TargetMode.SelectUnless,
                    dependsOn: 'targetUnit',
                    choosingPlayer: RelativePlayer.Opponent,
                    activePromptTitle: (context) => `${context.targets.targetUnit.title} takes 2 [Damage] or Opponent [Draws] a card`,
                    unlessEffect: {
                        effect: (context) => abilityHelper.immediateEffects.damage({
                            target: context.targets.targetUnit,
                            amount: 2
                        }),
                        promptButtonText: NamedAction.Damage
                    },
                    defaultEffect: {
                        effect: abilityHelper.immediateEffects.draw({ amount: 1 }),
                        promptButtonText: NamedAction.Draw
                    },
                    highlightCards: (context) => context.targets.targetUnit,
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
