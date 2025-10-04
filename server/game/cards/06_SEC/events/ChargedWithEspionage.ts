import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Aspect } from '../../../core/Constants';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';

export default class ChargedWithEspionage extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'charged-with-espionage-id',
            internalName: 'charged-with-espionage',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        const aspects = [Aspect.Cunning, Aspect.Cunning];
        registrar.setEventAbility({
            title: `Disclose ${EnumHelpers.aspectString(aspects)}. If you do, look at an opponent's hand and discard a unit from it`,
            immediateEffect: abilityHelper.immediateEffects.disclose({ aspects }),
            ifYouDo: {
                title: 'Look at an opponent\'s hand and discard a unit from it',
                immediateEffect: abilityHelper.immediateEffects.lookAtAndSelectCard((context) => ({
                    target: context.player.opponent.hand,
                    canChooseFewer: false,
                    immediateEffect: abilityHelper.immediateEffects.discardSpecificCard(),
                    cardCondition: (card) => card.isUnit()
                }))
            }
        });
    }
}