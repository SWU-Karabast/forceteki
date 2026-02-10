import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class DirectorKrennicAmidstMyAchievement extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1627648051',
            internalName: 'director-krennic#amidst-my-achievement'
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Create a Credit token',
            cost: [
                AbilityHelper.costs.exhaustSelf(),
                AbilityHelper.costs.defeat({
                    activePromptTitle: 'Defeat a friendly unit',
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self
                })
            ],
            immediateEffect: AbilityHelper.immediateEffects.createCreditToken()
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Another friendly unit deals damage equal to its power to an enemy unit',
            when: {
                onLeaderDeployed: (event, context) =>
                    event.card === context.source
            },
            targetResolvers: {
                friendlyUnit: {
                    activePromptTitle: 'Select a friendly unit',
                    controller: RelativePlayer.Self,
                    zoneFilter: WildcardZoneName.AnyArena,
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card, context) => card !== context.source,
                },
                damageTarget: {
                    activePromptTitle: (context) => `Deal ${context.targets.friendlyUnit.getPower()} damage to an enemy unit`,
                    dependsOn: 'friendlyUnit',
                    controller: RelativePlayer.Opponent,
                    zoneFilter: WildcardZoneName.AnyArena,
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                        amount: context.targets.friendlyUnit.getPower(),
                        source: context.targets.friendlyUnit
                    })),
                }
            }
        });
    }
}