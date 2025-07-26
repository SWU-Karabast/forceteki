import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, TargetMode, WildcardCardType } from '../../../core/Constants';

export default class LeiaOrganaGetToYourTransports extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9970912404',
            internalName: 'leia-organa#get-to-your-transports'
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Heal 1 damage from a friendly unit',
            cost: [abilityHelper.costs.abilityActivationResourceCost(1), abilityHelper.costs.exhaustSelf()],
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                immediateEffect: abilityHelper.immediateEffects.heal({ amount: 1 })
            },
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Heal 1 damage from a friendly unit and 1 damage from another friendly unit',
            targetResolver: {
                activePromptTitle: 'Choose units to heal 1 damage to',
                mode: TargetMode.ExactlyVariable,
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                numCardsFunc: (context) => Math.min(2, context.player.getArenaUnits().length),
                immediateEffect: abilityHelper.immediateEffects.heal({ amount: 1 })
            }
        });
    }
}
