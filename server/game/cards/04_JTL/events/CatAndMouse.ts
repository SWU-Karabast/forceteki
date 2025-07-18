import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class CatAndMouse extends EventCard {
    protected override getImplementationId () {
        return {
            id: '3658858659',
            internalName: 'cat-and-mouse',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Exhaust an enemy unit. If you do, ready a friendly unit in the same arena with power equal to or less than that enemy unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Opponent,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Ready a friendly unit in the same arena with power equal to or less than that enemy unit',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                    cardCondition: (card) =>
                        card.zone === ifYouDoContext.target.zone &&
                        card.isUnit() && ifYouDoContext.target.isUnit() &&
                        card.getPower() <= ifYouDoContext.target.getPower(),
                    immediateEffect: AbilityHelper.immediateEffects.ready()
                }
            })
        });
    }
}
