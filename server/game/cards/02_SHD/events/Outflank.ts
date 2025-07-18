import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class Outflank extends EventCard {
    protected override getImplementationId () {
        return {
            id: '0802973415',
            internalName: 'outflank',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Attack with two units (one at a time)',
            targetResolver: {
                immediateEffect: AbilityHelper.immediateEffects.attack()
            },
            then: (thenContext) => ({
                title: 'Attack with another unit',
                initiateAttack: {
                    attackerCondition: (card) => thenContext.target !== card
                }
            })
        });
    }
}
