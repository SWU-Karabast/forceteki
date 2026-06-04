import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { WildcardCardType } from '../../../core/Constants';

export default class DisplayOfStrength extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6866286566',
            internalName: 'display-of-strength',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Give a unit +3/+3 for this phase',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: abilityHelper.ongoingEffects.modifyStats({ power: 3, hp: 3 })
                })
            }
        });
    }
}