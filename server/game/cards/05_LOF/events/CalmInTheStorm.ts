import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class CalmInTheStorm extends EventCard {
    protected override getImplementationId() {
        return {
            id: '9854991700',
            internalName: 'calm-in-the-storm',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Exhaust a friendly unit. If you do, give a Shield token and 2 Experience tokens to it.',
            targetResolvers: {
                friendlyUnit: {
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                    immediateEffect: AbilityHelper.immediateEffects.exhaust()
                }
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Give a Shield token and 2 Experience tokens to it',
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.giveExperience({
                        target: ifYouDoContext.targets.friendlyUnit,
                        amount: 2
                    }),
                    AbilityHelper.immediateEffects.giveShield({
                        target: ifYouDoContext.targets.friendlyUnit
                    })
                ])
            })
        });
    }
}
