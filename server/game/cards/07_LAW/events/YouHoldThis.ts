import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class YouHoldThis extends EventCard {
    protected override getImplementationId () {
        return {
            id: 'you-hold-this-id',
            internalName: 'you-hold-this',
        };
    }

    public override setupCardAbilities (registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Choose a friendly non-leader unit. An opponent takes control of it.',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                immediateEffect: abilityHelper.immediateEffects.takeControlOfUnit((context) => ({
                    newController: context.player.opponent,
                }))
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Deal 4 damage to another unit in the same area',
                targetResolver: {
                    cardCondition: (card) => card.isUnit() && card !== ifYouDoContext.target && card.zone === ifYouDoContext.target.zone,
                    immediateEffect: abilityHelper.immediateEffects.damage({ amount: 4 })
                }
            })
        });
    }
}