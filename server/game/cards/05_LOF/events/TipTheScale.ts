import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class TipTheScale extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6491675327',
            internalName: 'tip-the-scale',
        };
    }

    protected override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Look at an opponents hand. Discard a non-unit card from it.',
            immediateEffect: AbilityHelper.immediateEffects.lookAtAndSelectCard((context) => ({
                target: context.player.opponent.hand,
                canChooseFewer: false,
                immediateEffect: AbilityHelper.immediateEffects.discardSpecificCard(),
                cardCondition: (card) => !card.isUnit()
            }))
        });
    }
}