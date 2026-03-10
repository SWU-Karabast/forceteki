import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class LomPykeMakingAWithdrawal extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4392072397',
            internalName: 'lom-pyke#making-a-withdrawal',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        // THIS IMPLEMENTATION IS NOT ACCURATE FOR TWIN SUNS
        registrar.addWhenPlayedAbility({
            title: 'Heal 5 damage from your base. If you do, your opponent gives 2 Experience tokens to a unit',
            optional: true,
            playerChoosingOptional: RelativePlayer.Opponent,
            immediateEffect: abilityHelper.immediateEffects.heal((context) => ({
                amount: 5,
                target: context.player.opponent.base,
            })),
            ifYouDo: {
                title: 'Give 2 Experience tokens to a unit',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: abilityHelper.immediateEffects.giveExperience({ amount: 2 })
                }
            }
        });
    }
}