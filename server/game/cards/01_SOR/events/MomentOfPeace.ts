import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class MomentOfPeace extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8981523525',
            internalName: 'moment-of-peace',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Give a shield token to a unit',
            targetResolver: {
                immediateEffect: AbilityHelper.immediateEffects.giveShield()
            }
        });
    }
}
