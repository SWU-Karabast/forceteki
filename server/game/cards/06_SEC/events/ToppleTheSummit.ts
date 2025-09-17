import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class ToppleTheSummit extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'topple-the-summit-id',
            internalName: 'topple-the-summit',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Deal 3 damage to each damaged unit',
            immediateEffect: abilityHelper.immediateEffects.damage((context) => ({
                target: context.game.getArenaUnits({ condition: (card) => card.isUnit() && card.damage > 0 }),
                amount: 3
            })),
        });
    }
}