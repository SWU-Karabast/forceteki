import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { AbilityRestriction, WildcardCardType } from '../../../core/Constants';

export default class GoIntoHiding extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5787840677',
            internalName: 'go-into-hiding',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Choose a unit. It cannot be attacked this phase',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.cardCannot(AbilityRestriction.BeAttacked),
                }),
            }
        });
    }
}