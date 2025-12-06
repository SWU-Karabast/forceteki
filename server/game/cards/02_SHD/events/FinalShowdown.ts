import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { PhaseName } from '../../../core/Constants';

export default class FinalShowdown extends EventCard {
    protected override getImplementationId () {
        return {
            id: '1910812527',
            internalName: 'final-showdown',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Ready each unit you control. At the start of the regroup phase, you lose the game',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.ready((context) => ({
                    target: context.player.getArenaUnits(),
                })),
                AbilityHelper.immediateEffects.delayedPlayerEffect((context) => ({
                    title: 'You lose the game',
                    when: {
                        onPhaseStarted: (context) => context.phase === PhaseName.Regroup
                    },
                    effectDescription: 'lose the game at the start of the regroup phase',
                    immediateEffect: AbilityHelper.immediateEffects.loseGame({
                        target: context.player
                    })
                })),
            ]),
        });
    }
}
