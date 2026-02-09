import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType } from '../../../core/Constants';

export default class LostAndForgotten extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'lost-and-forgotten-id',
            internalName: 'lost-and-forgotten',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Defeat a non-leader unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            },
            ifYouDo: {
                title: 'Heal 3 damage from your base',
                immediateEffect: AbilityHelper.immediateEffects.heal((context) => ({ amount: 3, target: context.player.base }))
            }
        });
    }
}