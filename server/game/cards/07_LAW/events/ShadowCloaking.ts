import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';

export default class ShadowCloaking extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'shadow-cloaking-id',
            internalName: 'shadow-cloaking',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Ready a unit and give a Shield token to it',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.simultaneous([
                    abilityHelper.immediateEffects.ready(),
                    abilityHelper.immediateEffects.giveShield()
                ])
            }
        });
    }
}