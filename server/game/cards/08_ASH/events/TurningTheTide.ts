import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType } from '../../../core/Constants';

export default class TurningTheTide extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'turning-the-tide-id',
            internalName: 'turning-the-tide',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Deal 1 damage to a unit for each friendly unit',
            targetResolver: {
                activePromptTitle: (context) => `Choose a unit to deal ${context.player.getArenaUnits().length} damage to`,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({ amount: context.player.getArenaUnits().length })),
            }
        });
    }
}