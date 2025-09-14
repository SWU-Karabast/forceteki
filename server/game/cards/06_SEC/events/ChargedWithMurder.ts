import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Aspect, WildcardCardType } from '../../../core/Constants';
import * as Helpers from '../../../core/utils/Helpers';

export default class ChargedWithMurder extends EventCard {
    protected override getImplementationId () {
        return {
            id: '7930132943',
            internalName: 'charged-with-murder',
        };
    }

    public override setupCardAbilities (registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        const aspects = [Aspect.Vigilance, Aspect.Vigilance];
        registrar.setEventAbility({
            title: `Disclose ${Helpers.aspectString(aspects)}. If you do, defeat a damaged non-leader unit`,
            immediateEffect: abilityHelper.immediateEffects.disclose({ aspects }),
            ifYouDo: {
                title: 'Defeat a damaged non-leader unit',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.NonLeaderUnit,
                    cardCondition: (card) => card.isNonLeaderUnit() && card.damage > 0,
                    immediateEffect: abilityHelper.immediateEffects.defeat()
                }
            }
        });
    }
}