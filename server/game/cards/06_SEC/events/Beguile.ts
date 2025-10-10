import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class Beguile extends EventCard {
    protected override getImplementationId () {
        return {
            id: 'beguile-id',
            internalName: 'beguile',
        };
    }

    public override setupCardAbilities (registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Look at an opponent\'s hand. Then, return to hand an enemy non-leader unit which costs 6 or less',
            immediateEffect: abilityHelper.immediateEffects.lookAt((context) => ({
                target: context.player.opponent.hand,
                useDisplayPrompt: true
            })),
            then: {
                title: 'Return to hand an enemy non-leader unit which costs 6 or less',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.NonLeaderUnit,
                    controller: RelativePlayer.Opponent,
                    cardCondition: (card) => card.isNonLeaderUnit() && card.cost <= 6,
                    immediateEffect: abilityHelper.immediateEffects.returnToHand()
                }
            }
        });
    }
}