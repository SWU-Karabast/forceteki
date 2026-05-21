import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class ZitonMojSowingChaos extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4124659733',
            internalName: 'ziton-moj#sowing-chaos',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        // THIS IMPLEMENTATION IS NOT ACCURATE FOR TWIN SUNS
        registrar.addOnAttackAbility({
            title: 'For each player, deal 1 damage to a unit that player controls',
            targetResolvers: {
                friendlyUnit: {
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                    immediateEffect: abilityHelper.immediateEffects.damage({ amount: 1 }),
                },
                enemyUnit: {
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Opponent,
                    immediateEffect: abilityHelper.immediateEffects.damage({ amount: 1 }),
                }
            }
        });
    }
}