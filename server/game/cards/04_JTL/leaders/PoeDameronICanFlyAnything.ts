import AbilityHelper from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, Trait, AbilityType, WildcardZoneName, WildcardCardType } from '../../../core/Constants';

export default class PoeDameronICanFlyAnything extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8520821318',
            internalName: 'poe-dameron#i-can-fly-anything',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar) {
        registrar.addActionAbility({
            title: `Flip ${this.title} and attach him as an upgrade to a friendly Vehicle unit without a Pilot on it`,
            cost: [
                AbilityHelper.costs.exhaustSelf(),
                AbilityHelper.costs.abilityActivationResourceCost(1),
            ],
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.isUnit() && card.hasSomeTrait(Trait.Vehicle) && !card.upgrades.some((upgrade) => upgrade.hasSomeTrait(Trait.Pilot)),
                immediateEffect: AbilityHelper.immediateEffects.flipAndAttachPilotLeader((context) => ({
                    leaderPilotCard: context.source,
                })),
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar) {
        registrar.addPilotingAbility({
            type: AbilityType.Action,
            title: 'Attach this upgrade to a friendly Vehicle unit without a Pilot on it',
            cost: AbilityHelper.costs.abilityActivationResourceCost(1),
            limit: AbilityHelper.limit.perRound(1),
            zoneFilter: WildcardZoneName.AnyArena,
            targetResolver: {
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.isUnit() && card.hasSomeTrait(Trait.Vehicle) && !card.upgrades.some((upgrade) => upgrade.hasSomeTrait(Trait.Pilot)),
                immediateEffect: AbilityHelper.immediateEffects.attachUpgrade((context) => ({
                    upgrade: context.source,
                })),
            }
        });
    }
}
