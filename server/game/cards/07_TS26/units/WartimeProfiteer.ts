import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer } from '../../../core/Constants';

export default class WartimeProfiteer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2014524470',
            internalName: 'wartime-profiteer',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        // THIS IMPLEMENTATION IS NOT ACCURATE FOR TWIN SUNS
        registrar.addWhenDefeatedAbility({
            title: 'Ready a resource',
            optional: true,
            playerChoosingOptional: RelativePlayer.Opponent,
            immediateEffect: abilityHelper.immediateEffects.readyResources((context) => ({
                target: context.player.opponent,
                amount: 1
            }))
        });
    }
}