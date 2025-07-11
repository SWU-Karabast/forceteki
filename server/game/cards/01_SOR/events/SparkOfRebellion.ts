import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class SparkOfRebellion extends EventCard {
    protected override getImplementationId() {
        return {
            id: '2050990622',
            internalName: 'spark-of-rebellion'
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Look at an opponent\'s hand and discard a card from it',
            immediateEffect: AbilityHelper.immediateEffects.lookAtAndSelectCard((context) => ({
                target: context.player.opponent.hand,
                immediateEffect: AbilityHelper.immediateEffects.discardSpecificCard()
            }))
        });
    }
}
