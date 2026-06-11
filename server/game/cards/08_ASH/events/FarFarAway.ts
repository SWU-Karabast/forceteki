import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class FarFarAway extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6508831546',
            internalName: 'far-far-away',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Return a friendly non-leader unit to its owner\'s hand. If you do, return an enemy non-leader unit to its owner\'s hand.',
            targetResolver: {
                activePromptTitle: 'Choose a friendly non-leader unit to return to hand',
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            },
            ifYouDo: {
                title: 'Return an enemy non-leader unit to its owner\'s hand',
                targetResolver: {
                    activePromptTitle: 'Choose an enemy non-leader unit to return to hand',
                    controller: RelativePlayer.Opponent,
                    cardTypeFilter: WildcardCardType.NonLeaderUnit,
                    immediateEffect: AbilityHelper.immediateEffects.returnToHand()
                }
            }
        });
    }
}
