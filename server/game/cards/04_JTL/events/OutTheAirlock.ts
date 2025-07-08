import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import AbilityHelper from '../../../AbilityHelper';
import { WildcardCardType } from '../../../core/Constants';

export default class OutTheAirlock extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3782661648',
            internalName: 'out-the-airlock'
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Give a unit -5/-5 for this phase',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: -5, hp: -5 })
                })
            }
        });
    }
}
