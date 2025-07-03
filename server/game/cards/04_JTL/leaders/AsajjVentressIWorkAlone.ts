import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { AbilityType, KeywordName, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class AsajjVentressIWorkAlone extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4179470615',
            internalName: 'asajj-ventress#i-work-alone',
        };
    }

    protected override setupLeaderSideAbilities(card: this) {
        card.addPilotDeploy();

        card.addActionAbility({
            title: 'Deal 1 damage to a friendly unit. If you do, deal 1 damage to an enemy unit in the same arena.',
            cost: [AbilityHelper.costs.exhaustSelf()],
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
            },
            ifYouDo: (ifYouDoContext) => {
                const friendlyArena = ifYouDoContext.events[0].lastKnownInformation?.arena ?? ifYouDoContext.target.zoneName;
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

    protected override setupLeaderUnitSideAbilities(card: this) {
        card.addPilotingGainKeywordTargetingAttached({
            keyword: KeywordName.Grit,
        });

        card.addPilotingGainAbilityTargetingAttached({
            type: AbilityType.Triggered,
            title: 'Deal 1 damage to a friendly unit. If you do, deal 1 damage to an enemy unit in the same arena.',
            optional: true,
            when: {
                onAttack: true,
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
            },
            ifYouDo: (ifYouDoContext) => {
                const friendlyArena = ifYouDoContext.events[0].lastKnownInformation?.arena ?? ifYouDoContext.target.zoneName;
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
}