import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';

export default class CrippleAuthority extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3228620062',
            internalName: 'cripple-authority',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Draw a card. Each opponent who controls more resources than you discards a card from their hand',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous(
                (context) => [
                    AbilityHelper.immediateEffects.draw({
                        target: context.source.controller,
                        amount: 1
                    }),
                    AbilityHelper.immediateEffects.conditional({
                        condition: context.source.controller.opponent.resources.length > context.source.controller.resources.length,
                        onTrue: AbilityHelper.immediateEffects.discardCardsFromOwnHand({
                            target: context.source.controller.opponent,
                            amount: 1
                        }),
                        onFalse: AbilityHelper.immediateEffects.noAction()
                    })
                ]
            )
        });
    }
}
