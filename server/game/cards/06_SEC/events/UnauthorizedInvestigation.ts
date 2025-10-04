import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Aspect } from '../../../core/Constants';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';

export default class UnauthorizedInvestigation extends EventCard {
    protected override getImplementationId () {
        return {
            id: 'unauthorized-investigation-id',
            internalName: 'unauthorized-investigation',
        };
    }

    public override setupCardAbilities (registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        const aspects = [Aspect.Aggression];
        registrar.setEventAbility({
            title: `Create a Spy token. You may disclose ${EnumHelpers.aspectString(aspects)}. If you do, create another Spy token`,
            immediateEffect: abilityHelper.immediateEffects.createSpy(),
            then: ({
                title: `Disclose ${EnumHelpers.aspectString(aspects)} to create another Spy token`,
                immediateEffect: abilityHelper.immediateEffects.disclose({ aspects }),
                ifYouDo: {
                    title: 'Create another Spy token',
                    immediateEffect: abilityHelper.immediateEffects.createSpy(),
                }
            })
        });
    }
}
