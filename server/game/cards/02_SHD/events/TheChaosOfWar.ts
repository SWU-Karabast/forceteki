import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';

export default class TheChaosOfWar extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8090818642',
            internalName: 'the-chaos-of-war',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Deal damage to each player’s base equal to the number of cards in that player’s hand.',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.damage((context) => ({
                    amount: context.source.controller.opponent.hand.length,
                    target: context.source.controller.opponent.base,
                })),
                AbilityHelper.immediateEffects.damage((context) => ({
                    amount: context.source.controller.hand.length,
                    target: context.source.controller.base,
                })),
            ]),
        });
    }
}
