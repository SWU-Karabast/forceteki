import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class ProtectorateFighter extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: 'protectorate-fighter-id',
            internalName: 'protectorate-fighter'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Create a Mandalorian token',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.hasSomeArenaUnit({ condition: (card) => card.isUnit() && card.unique }),
                onTrue: AbilityHelper.immediateEffects.createMandalorian(),
            })
        });
    }
}
