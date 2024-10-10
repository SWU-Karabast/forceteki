import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { Location, RelativePlayer } from '../../../core/Constants';

export default class CrippleAuthority extends EventCard {
    protected override getImplementationId () {
        return {
            id: '3228620062',
            internalName: 'cripple-authority',
        };
    }

    public override setupCardAbilities () {
        this.setEventAbility({
            title: 'Each opponent discards a card from their hand. Draw a card',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.draw((context) => ({ target: context.source.controller, amount: 1 })),
                AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.source.controller.opponent.resources.length > context.source.controller.resources.length,
                    onFalse: AbilityHelper.immediateEffects.noAction(),
                    onTrue: AbilityHelper.immediateEffects.selectCard({
                        controller: RelativePlayer.Opponent,
                        locationFilter: Location.Hand,
                        innerSystem: AbilityHelper.immediateEffects.discardCard()
                    }),
                }),
            ])
        });
    }
}

CrippleAuthority.implemented = true;
