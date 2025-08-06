import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Duration } from '../../../core/Constants';

export default class PremonitionOfDoom extends EventCard {
    protected override getImplementationId() {
        return {
            id: '9129337737',
            internalName: 'premonition-of-doom',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'The next time you take the initiative this phase, exhaust all units',
            immediateEffect: AbilityHelper.immediateEffects.delayedPlayerEffect({
                title: 'Exhaust all units',
                duration: Duration.UntilEndOfPhase,
                when: {
                    onClaimInitiative: (event, context) => event.player === context.player
                },
                immediateEffect: AbilityHelper.immediateEffects.exhaust((context) => ({
                    target: context.game.getArenaUnits()
                }))
            })
        });
    }
}