import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Trait, WildcardCardType } from '../../../core/Constants';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class Eject extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8993849612',
            internalName: 'eject',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Detach a Pilot upgrade, move it to the ground arena as a unit, and exhaust it. Draw a card.',
            immediateEffect: abilityHelper.immediateEffects.simultaneous([
                abilityHelper.immediateEffects.selectCard({
                    activePromptTitle: 'Detach a Pilot upgrade, move it to the ground arena as a unit, and exhaust it',
                    cardTypeFilter: WildcardCardType.UnitUpgrade,
                    cardCondition: (card) => card.hasSomeTrait(Trait.Pilot),
                    immediateEffect: abilityHelper.immediateEffects.sequential([
                        abilityHelper.immediateEffects.detachPilot(),
                        abilityHelper.immediateEffects.exhaust(),
                    ])
                }),
                abilityHelper.immediateEffects.draw((context) => ({ target: context.player }))
            ])
        });
    }
}
