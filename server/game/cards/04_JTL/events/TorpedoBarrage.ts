import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { TargetMode } from '../../../core/Constants';

export default class TorpedoBarrage extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7456670756',
            internalName: 'torpedo-barrage',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Deal 5 indirect damage to a player',
            targetResolver: {
                mode: TargetMode.Player,
                immediateEffect: AbilityHelper.immediateEffects.indirectDamageToPlayer({ amount: 5 }),
            }
        });
    }
}
