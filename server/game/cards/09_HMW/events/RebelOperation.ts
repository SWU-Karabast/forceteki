import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { CardType, Trait, WildcardCardType } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class RebelOperation extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5533325371',
            internalName: 'rebel-operation',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addDecreaseCostAbility({
            title: `This card costs ${TextHelper.resource(1)} less to play for each friendly ${TextHelper.Trait.Rebel} unit and leader`,
            amount: (_card, player) => player.getInPlayCards({
                type: [WildcardCardType.Unit, CardType.Leader, CardType.LeaderUpgrade],
                trait: Trait.Rebel
            }).length
        });

        registrar.setEventAbility({
            title: 'Draw 2 cards',
            immediateEffect: abilityHelper.immediateEffects.draw({ amount: 2 })
        });
    }
}
