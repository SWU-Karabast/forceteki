import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { AbilityType, KeywordName, RelativePlayer, WildcardCardType } from '../../../core/Constants';
import type { ICardStateGetter } from '../../../core/lki/CardStateGetter';

export default class AsajjVentressIWorkAlone extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4179470615',
            internalName: 'asajj-ventress#i-work-alone',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper, cardStates: ICardStateGetter) {
        registrar.addPilotDeploy();

        registrar.addActionAbility({
            title: 'Deal 1 damage to a friendly unit. If you do, deal 1 damage to an enemy unit in the same arena.',
            cost: [AbilityHelper.costs.exhaustSelf()],
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
            },
            ifYouDo: (ifYouDoContext) => {
                // The arena the damaged unit was in. If the damage defeated it, this comes from its
                // last known information rather than the discard pile it now sits in.
                const friendlyArena = cardStates.getLastKnownProperties(ifYouDoContext.target).zoneName;
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

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper, cardStates: ICardStateGetter) {
        registrar.addPilotingGainKeywordTargetingAttached({
            keyword: KeywordName.Grit,
        });

        registrar.addPilotingGainAbilityTargetingAttached({
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
                const friendlyArena = cardStates.getLastKnownProperties(ifYouDoContext.target).zoneName;
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