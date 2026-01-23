import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class Haymaker extends EventCard {
    protected override getImplementationId () {
        return {
            id: 'haymaker-id',
            internalName: 'haymaker',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Give a friendly unit an Experience token',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.giveExperience(),
            },
            then: (thenContext) => ({
                title: 'Deal damage equal to the unit\'s power to an enemy unit in the same arena',
                thenCondition: (context) => context.target != null,
                targetResolver: {
                    controller: RelativePlayer.Opponent,
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card) =>
                        card.zone === thenContext.target?.zone,
                    immediateEffect: AbilityHelper.immediateEffects.damage({
                        amount: thenContext.target?.getPower(),
                        optional: false,
                    })
                }
            })
        });
    }
}
