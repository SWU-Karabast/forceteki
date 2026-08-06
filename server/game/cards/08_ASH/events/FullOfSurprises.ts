import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';

export default class FullOfSurprises extends EventCard {
    protected override getImplementationId() {
        return {
            id: '4547747622',
            internalName: 'full-of-surprises',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.setEventAbility({
            title: 'Return an upgrade that costs 2 or less to its owner\'s hand. Give a Shield token to a unit',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.selectCard({
                    activePromptTitle: 'Return an upgrade that costs 2 or less to its owner\'s hand',
                    cardCondition: (card) => card.isUpgrade() && card.cost <= 2,
                    immediateEffect: AbilityHelper.immediateEffects.returnToHand()
                }),
                AbilityHelper.immediateEffects.selectCard({
                    activePromptTitle: 'Give a Shield token to a unit',
                    cardCondition: (card) => card.isUnit(),
                    immediateEffect: AbilityHelper.immediateEffects.giveShield()
                }),
            ])
        });
    }
}