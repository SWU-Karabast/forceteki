import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, TargetMode, WildcardCardType } from '../../../core/Constants';

export default class KazudaXionoBestPilotInTheGalaxy extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4531112134',
            internalName: 'kazuda-xiono#best-pilot-in-the-galaxy'
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addPilotDeploy();
        this.addActionAbility({
            title: 'Select a friendly unit',
            cost: AbilityHelper.costs.exhaustSelf(),
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                    innerSystem: AbilityHelper.immediateEffects.forThisRoundCardEffect({
                        effect: AbilityHelper.ongoingEffects.loseAllAbilities()
                    })
                }),
                AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.additionalAction()
                })
            ])
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addOnAttackAbility({
            title: 'Choose any number of friendly units',
            targetResolver: {
                activePromptTitle: 'Choose friendly units that will lose all abilities for this round',
                mode: TargetMode.Unlimited,
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                canChooseNoCards: true,
                immediateEffect: AbilityHelper.immediateEffects.forThisRoundCardEffect({
                    effect: AbilityHelper.ongoingEffects.loseAllAbilities()
                })
            }
        });

        this.addPilotingGainTriggeredAbilityTargetingAttached({
            title: 'Choose any number of friendly units',
            when: {
                onAttackDeclared: (event, context) => event.attack.attacker === context.source
            },
            targetResolver: {
                activePromptTitle: 'Choose friendly units that will lose all abilities for this round',
                mode: TargetMode.Unlimited,
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                canChooseNoCards: true,
                immediateEffect: AbilityHelper.immediateEffects.forThisRoundCardEffect({
                    effect: AbilityHelper.ongoingEffects.loseAllAbilities()
                })
            }
        });
    }
}