import { type IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class ImprovisedDetonation extends EventCard {
    protected override getImplementationId() {
        return {
            id: '1758639231',
            internalName: 'improvised-detonation',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Attack with a unit. It gets +2/+0 for this attack.',
            targetResolver: {
                immediateEffect: abilityHelper.immediateEffects.attack({
                    attackerLastingEffects: { effect: abilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }) }
                })
            }
        });
    }
}