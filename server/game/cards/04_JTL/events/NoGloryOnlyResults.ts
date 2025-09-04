import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType } from '../../../core/Constants';

export default class NoGloryOnlyResults extends EventCard {
    protected override getImplementationId() {
        return {
            id: '9810057689',
            internalName: 'no-glory-only-results',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Take control of a non-leader unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                immediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.takeControlOfUnit((context) => ({
                        newController: context.player,
                    })),
                    AbilityHelper.immediateEffects.defeat()
                ])
            }
        });
    }
}
