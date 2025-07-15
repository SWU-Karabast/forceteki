import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class LandingShuttle extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0596500013',
            internalName: 'landing-shuttle',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addWhenDefeatedAbility({
            title: 'Draw a card',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.draw()
        });
    }
}