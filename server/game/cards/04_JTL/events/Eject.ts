import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Trait, WildcardCardType } from '../../../core/Constants';
import AbilityHelper from '../../../AbilityHelper';

export default class Eject extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8993849612',
            internalName: 'eject',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Detach a Pilot upgrade, move it to the ground arena as a unit, and exhaust it. Draw a card.',
            targetResolver: {
                cardTypeFilter: WildcardCardType.UnitUpgrade,
                cardCondition: (card) => card.hasSomeTrait(Trait.Pilot),
                immediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.detachPilot(),
                    AbilityHelper.immediateEffects.exhaust(),
                    AbilityHelper.immediateEffects.draw((context) => ({ target: context.player }))
                ])
            }
        });
    }
}
