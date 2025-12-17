import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';

export default class UnmarkedCredits extends EventCard {
    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    protected override get overrideNotImplemented(): boolean {
        return true;
    }

    protected override getImplementationId() {
        return {
            id: 'unmarked-credits-id',
            internalName: 'unmarked-credits',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Create a Credit token',
            immediateEffect: AbilityHelper.immediateEffects.createCreditToken()
        });
    }
}