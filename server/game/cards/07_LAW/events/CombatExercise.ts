import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer } from '../../../core/Constants';

export default class CombatExercise extends EventCard {
    protected override getImplementationId () {
        return {
            id: 'combat-exercise-id',
            internalName: 'combat-exercise',
        };
    }

    public override setupCardAbilities (registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Exhaust a friendy unit. If you do, give two Experience tokens to it.',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.isUnit(),
                immediateEffect: abilityHelper.immediateEffects.simultaneous([
                    abilityHelper.immediateEffects.exhaust(),
                    abilityHelper.immediateEffects.giveExperience({ amount: 2 })
                ])
            }

        });
    }
}