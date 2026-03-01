import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import {
    AbilityType,
    KeywordName,
    PlayType,
    RelativePlayer,
    Trait,
    WildcardCardType,
    ZoneName
} from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class WedgeAntillesLeaderOfRedSquadron extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0011262813',
            internalName: 'wedge-antilles#leader-of-red-squadron',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addPilotDeploy();

        registrar.addActionAbility({
            title: 'Play a card from your hand using Piloting. It costs 1 less.',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                cardCondition: (card) => card.hasSomeKeyword(KeywordName.Piloting), // This helps prevent a prompt error
                immediateEffect: AbilityHelper.immediateEffects.playCard({
                    playType: PlayType.Piloting,
                    playAsType: WildcardCardType.Upgrade,
                    adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 1 }
                })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addPilotingGainAbilityTargetingAttached({
            type: AbilityType.Triggered,
            title: 'The next Pilot you play this phase costs 1 less',
            when: {
                onAttack: true,
            },
            immediateEffect: AbilityHelper.immediateEffects.forThisPhasePlayerEffect({
                effect: AbilityHelper.ongoingEffects.decreaseCost({
                    match: (card) => card.hasSomeTrait(Trait.Pilot),
                    limit: AbilityHelper.limit.perPlayerPerGame(1),
                    amount: 1
                })
            })
        });
    }
}