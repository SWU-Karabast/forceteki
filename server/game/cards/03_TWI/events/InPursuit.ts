import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class InPursuit extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6401761275',
            internalName: 'in-pursuit'
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Exhaust a friendly unit. If you do, exhaust an enemy unit',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            },
            ifYouDo: {
                title: 'Exhaust an enemy unit',
                targetResolver: {
                    controller: RelativePlayer.Opponent,
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.exhaust()
                }
            }
        });
    }
}
