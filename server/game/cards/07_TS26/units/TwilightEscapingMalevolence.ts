import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class TwilightEscapingMalevolence extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2922751567',
            internalName: 'twilight#escaping-malevolence',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Heal 3 damage from your base',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.discard.length >= 5,
                onTrue: abilityHelper.immediateEffects.heal((context) => ({
                    amount: 3,
                    target: context.player.base,
                }))
            })
        });
    }
}