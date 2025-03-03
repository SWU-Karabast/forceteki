import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { AbilityType, DeployType, RelativePlayer, WildcardCardType, WildcardRelativePlayer, WildcardZoneName } from '../../../core/Constants';

export default class AsajjVentressIWorkAlone extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4179470615',
            internalName: 'asajj-ventress#i-work-alone',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addPilotDeploy();

        this.addActionAbility({
            title: 'Deal 1 damage to a friendly unit. If you do, deal 1 damage to an enemy unit in the same arena.',
            cost: [AbilityHelper.costs.exhaustSelf()],
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
            },
            ifYouDo: (ifYouDoContext) => {
                const friendlyArena = ifYouDoContext.target.zoneName;
                return {
                    title: `Deal 1 damage to an enemy unit in the ${friendlyArena} arena`,
                    targetResolver: {
                        cardTypeFilter: WildcardCardType.Unit,
                        controller: RelativePlayer.Opponent,
                        zoneFilter: friendlyArena,
                        immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
                    }
                };
            }
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addPilotingAbility({
            title: 'Deal up to 4 damage divided as you choose among any number of units.',
            type: AbilityType.Triggered,
            when: {
                onLeaderDeployed: (event, context) => event.leaderPilotCard === context.source && event.deployType === DeployType.LeaderUpgrade
            },
            zoneFilter: WildcardZoneName.AnyArena,
            immediateEffect: AbilityHelper.immediateEffects.distributeDamageAmong((context) => ({
                amountToDistribute: 4,
                canChooseNoTargets: true,
                canDistributeLess: true,
                controller: WildcardRelativePlayer.Any,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.isUnit(),
                source: context.source
            }))
        });
    }
}