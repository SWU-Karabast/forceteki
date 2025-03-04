import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { AbilityType, DamageType, DeployType, TargetMode, WildcardCardType, WildcardRelativePlayer, WildcardZoneName } from '../../../core/Constants';

export default class BobaFettAnyMethodsNecessary extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9831674351',
            internalName: 'boba-fett#any-methods-necessary',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addPilotDeploy();

        this.addTriggeredAbility({
            title: 'Exhaust this leader',
            optional: true,
            when: {
                onDamageDealt: (event, context) => event.damageSource.player === context.player && event.type !== DamageType.Combat && event.type !== DamageType.Overwhelm,
            },
            immediateEffect: AbilityHelper.immediateEffects.exhaust(),
            ifYouDo: {
                title: 'Deal 1 indirect damage to a player',
                targetResolver: {
                    mode: TargetMode.Player,
                    immediateEffect: AbilityHelper.immediateEffects.indirectDamageToPlayer({ amount: 1 })
                }
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