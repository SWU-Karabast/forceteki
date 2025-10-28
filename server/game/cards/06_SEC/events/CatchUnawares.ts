import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class CatchUnawares extends EventCard {
    protected override getImplementationId() {
        return {
            id: '9742037939',
            internalName: 'catch-unawares',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Attack with a unit. The defender gets -4/-0 for this attack.',
            initiateAttack: {
                defenderLastingEffects: {
                    effect: abilityHelper.ongoingEffects.modifyStats({ power: -4, hp: 0 }),
                }
            }
        });
    }
}
