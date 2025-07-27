import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class TheInvasionofChristophsis extends EventCard {
    protected override getImplementationId() {
        return {
            id: '2565830105',
            internalName: 'the-invasion-of-christophsis'
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Defeat each unit that your opponent controls.',
            immediateEffect: AbilityHelper.immediateEffects.defeat((context) => ({ target: context.player.opponent.getArenaUnits() }))
        });
    }
}
