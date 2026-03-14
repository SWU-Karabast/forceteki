import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { TargetMode, WildcardCardType } from '../../../core/Constants';

export default class EvadeArrest extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3505666313',
            internalName: 'evade-arrest',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.setEventAbility({
            title: 'Exhaust any number of non-unique units',
            targetResolver: {
                mode: TargetMode.Unlimited,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => !card.unique,
                immediateEffect: abilityHelper.immediateEffects.exhaust()
            }
        });
    }
}