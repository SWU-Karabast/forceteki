import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class ScrambleFighters extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5841647666',
            internalName: 'scramble-fighters',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Create and ready 8 TIE Fighters. They cannot attack bases this phase.',
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.createTieFighter({ amount: 8, entersReady: true }),
                AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                    effect: AbilityHelper.ongoingEffects.cannotAttackBase(),
                    target: context.events[0]?.generatedTokens
                }))
            ])
        });
    }
}
