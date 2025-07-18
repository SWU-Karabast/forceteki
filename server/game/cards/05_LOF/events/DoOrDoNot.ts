import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class DoOrDoNot extends EventCard {
    protected override getImplementationId() {
        return {
            id: '2062827036',
            internalName: 'do-or-do-not',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Use the Force. If you do, draw 2 cards. If you do not, draw 1 card',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.useTheForce(),
            ifYouDo: {
                title: 'Draw 2 cards',
                immediateEffect: AbilityHelper.immediateEffects.draw({
                    amount: 2,
                }),
            },
            ifYouDoNot: {
                title: 'Draw a card',
                immediateEffect: AbilityHelper.immediateEffects.draw(),
            },
        });
    }
}