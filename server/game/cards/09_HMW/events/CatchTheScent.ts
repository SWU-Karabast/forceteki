import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class CatchTheScent extends EventCard {
    protected override getImplementationId() {
        return {
            id: '9992522105',
            internalName: 'catch-the-scent',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Create 2 Beast tokens and ready 1 of them',
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.createBeast({ amount: 2 }),
                AbilityHelper.immediateEffects.ready((context) => ({ target: context.resolvedEvents[0]?.generatedTokens[0] }))
            ])
        });
    }
}