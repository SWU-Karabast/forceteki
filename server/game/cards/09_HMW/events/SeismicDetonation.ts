import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import type { Arena } from '../../../core/Constants';
import { PhaseName, TargetMode, ZoneName } from '../../../core/Constants';
import { EnumHelpers } from '../../../core/utils/EnumHelpers';

export default class SeismicDetonation extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'seismic-detonation-id',
            internalName: 'seismic-detonation',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Choose an arena. At the start of the next regroup phase, deal 3 damage to each enemy unit in that arena.',
            targetResolver: {
                mode: TargetMode.Select,
                activePromptTitle: 'Choose an arena',
                choices: {
                    ['Space']: this.eventEffect(ZoneName.SpaceArena, abilityHelper),
                    ['Ground']: this.eventEffect(ZoneName.GroundArena, abilityHelper),
                }
            }
        });
    }

    private eventEffect(arena: Arena, abilityHelper: IAbilityHelper) {
        return abilityHelper.immediateEffects.delayedPlayerEffect({
            title: `Deal 3 damage to each enemy unit in the ${EnumHelpers.arenaName(arena)}`,
            effectDescription: `deal 3 damage to each enemy unit in the ${EnumHelpers.arenaName(arena)}`,
            when: {
                onPhaseStarted: (context) => context.phase === PhaseName.Regroup,
            },
            immediateEffect: abilityHelper.immediateEffects.damage((context) => ({
                amount: 3,
                target: context.player.opponent.getArenaUnits({ arena })
            }))
        });
    }
}