import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode, ZoneName } from '../../../core/Constants';

export default class LightmakerIHaveAnIdea extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'lightmaker#i-have-an-idea-id',
            internalName: 'lightmaker#i-have-an-idea',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Choose an arena. Exhaust each enemy unit in that arena',
            targetResolver: {
                mode: TargetMode.Select,
                activePromptTitle: 'Choose an arena',
                choices: {
                    ['Space']: abilityHelper.immediateEffects.exhaust((context) => ({
                        target: context.player.opponent.getArenaUnits({ arena: ZoneName.SpaceArena })
                    })),
                    ['Ground']: abilityHelper.immediateEffects.exhaust((context) => ({
                        target: context.player.opponent.getArenaUnits({ arena: ZoneName.GroundArena })
                    }))
                }
            }
        });
    }
}
