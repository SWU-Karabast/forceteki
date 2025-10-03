import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { PhaseName, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class Arrest extends EventCard {
    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    protected override get overrideNotImplemented(): boolean {
        // TODO: Remove this when base capture UI is implemented on the client
        return true;
    }

    protected override getImplementationId() {
        return {
            id: '1407380526',
            internalName: 'arrest',
        };
    }

    public override setupCardAbilities(
        registrar: IEventAbilityRegistrar,
        AbilityHelper: IAbilityHelper
    ) {
        registrar.setEventAbility({
            title: 'Your base captures an enemy non-leader unit',
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous((context) => ([
                    AbilityHelper.immediateEffects.capture({
                        captor: context.player.base
                    }),
                    AbilityHelper.immediateEffects.delayedPlayerEffect({
                        title: 'The captured unit is rescued by its owner',
                        when: {
                            onPhaseStarted: (context) => context.phase === PhaseName.Regroup
                        },
                        effectDescription: 'apply an effect that rescues {0} at the start of the regroup phase',
                        immediateEffect: AbilityHelper.immediateEffects.rescue({
                            target: context.target
                        })
                    })
                ]))
            }
        });
    }
}