import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class CombatExercise extends EventCard {
    protected override getImplementationId () {
        return {
            id: 'combat-exercise-id',
            internalName: 'combat-exercise',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Exhaust a friendly unit. If you do, give 2 Experience tokens to it.',
            targetResolvers: {
                friendlyUnit: {
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                    immediateEffect: AbilityHelper.immediateEffects.exhaust()
                }
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Give 2 Experience tokens to it',
                immediateEffect: AbilityHelper.immediateEffects.giveExperience({
                    target: ifYouDoContext.targets.friendlyUnit,
                    amount: 2
                })
            })
        });
    }
}