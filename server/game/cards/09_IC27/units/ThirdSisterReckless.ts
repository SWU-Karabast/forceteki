import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class ThirdSisterReckless extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0244364164',
            internalName: 'third-sister#reckless',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Deal 1 damage to a friendly ground unit and 1 damage to an enemy ground unit',
            targetResolvers: {
                friendlyUnit: {
                    activePromptTitle: 'Deal 1 damage to a friendly ground unit',
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: ZoneName.GroundArena,
                    controller: RelativePlayer.Self,
                    immediateEffect: abilityHelper.immediateEffects.damage({ amount: 1 })
                },
                enemyUnit: {
                    activePromptTitle: 'Deal 1 damage to an enemy ground unit',
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: ZoneName.GroundArena,
                    controller: RelativePlayer.Opponent,
                    immediateEffect: abilityHelper.immediateEffects.damage({ amount: 1 })
                }
            }
        });
    }
}
