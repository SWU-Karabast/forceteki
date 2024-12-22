import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { KeywordName, RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';
import * as AbilityLimit from '../../../core/ability/AbilityLimit';

export default class JabbaTheHuttHisHighExaltedness extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0622803599',
            internalName: 'jabba-the-hutt#his-high-exaltedness',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Choose a unit. For this phase, it gains: "Bounty — The next unit you play this phase costs 1 resource less."',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.gainKeyword({
                        keyword: KeywordName.Bounty,
                        ability: {
                            title: 'The next unit you play this phase costs 1 resource less',
                            immediateEffect: AbilityHelper.immediateEffects.forThisPhasePlayerEffect(
                                (context) => ({
                                    targetController: context.player,
                                    effect: AbilityHelper.ongoingEffects.decreaseCost({
                                        cardTypeFilter: WildcardCardType.Unit,
                                        limit: AbilityLimit.perGame(1),
                                        amount: 1
                                    })
                                })
                            )
                        }
                    })
                })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addTriggeredAbility({
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

        this.addActionAbility({
            title: 'Choose a unit. For this phase, it gains: "Bounty — The next unit you play this phase costs 2 resources less."',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.gainKeyword({
                        keyword: KeywordName.Bounty,
                        ability: {
                            title: 'The next unit you play this phase costs 2 resources less',
                            immediateEffect: AbilityHelper.immediateEffects.forThisPhasePlayerEffect((context) => ({
                                targetController: context.player,
                                effect: AbilityHelper.ongoingEffects.decreaseCost({
                                    cardTypeFilter: WildcardCardType.Unit,
                                    limit: AbilityLimit.perGame(1),
                                    amount: 2
                                })
                            }))
                        }
                    })
                })
            }
        });
    }
}

JabbaTheHuttHisHighExaltedness.implemented = true;
