import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { KeywordName, RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class JabbaTheHuttHisHighExaltedness extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0622803599',
            internalName: 'jabba-the-hutt#his-high-exaltedness',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Choose a unit. For this phase, it gains: "Bounty — The next unit you play this phase costs 1 resource less."',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.gainKeyword({
                        keyword: KeywordName.Bounty,
                        ability: {
                            title: 'The next unit you play this phase costs 1 resource less',
                            immediateEffect: AbilityHelper.immediateEffects.forThisPhasePlayerEffect({
                                effect: AbilityHelper.ongoingEffects.decreaseCost({
                                    cardTypeFilter: WildcardCardType.Unit,
                                    limit: AbilityHelper.limit.perPlayerPerGame(1),
                                    amount: 1
                                })
                            })
                        }
                    })
                })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Another friendly unit captures an enemy non-leader unit',
            when: {
                onLeaderDeployed: (event, context) => event.card === context.source
            },
            targetResolvers: {
                friendlyUnit: {
                    zoneFilter: WildcardZoneName.AnyArena,
                    controller: RelativePlayer.Self,
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card, context) => card !== context.source
                },
                captureUnit: {
                    dependsOn: 'friendlyUnit',
                    controller: RelativePlayer.Opponent,
                    immediateEffect: AbilityHelper.immediateEffects.capture((context) => ({ captor: context.targets['friendlyUnit'] }))
                }
            }
        });

        registrar.addActionAbility({
            title: 'Choose a unit. For this phase, it gains: "Bounty — The next unit you play this phase costs 2 resources less."',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.gainKeyword({
                        keyword: KeywordName.Bounty,
                        ability: {
                            title: 'The next unit you play this phase costs 2 resources less',
                            immediateEffect: AbilityHelper.immediateEffects.forThisPhasePlayerEffect({
                                effect: AbilityHelper.ongoingEffects.decreaseCost({
                                    cardTypeFilter: WildcardCardType.Unit,
                                    limit: AbilityHelper.limit.perPlayerPerGame(1),
                                    amount: 2
                                })
                            })
                        }
                    })
                })
            }
        });
    }
}
