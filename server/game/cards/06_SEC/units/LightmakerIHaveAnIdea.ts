import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { type Arena, TargetMode, ZoneName } from '../../../core/Constants';

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
                    ['Ground']: this.eventEffect(ZoneName.GroundArena, abilityHelper),
                    ['Space']: this.eventEffect(ZoneName.SpaceArena, abilityHelper),
                }
            }
        });
    }

    private eventEffect(arena: Arena, AbilityHelper: IAbilityHelper) {
        return AbilityHelper.immediateEffects.conditional((context) => ({
            condition: context.player.opponent.hasSomeArenaUnit({ arena: arena }),
            onTrue: AbilityHelper.immediateEffects.exhaust((context) => {
                return {
                    target: context.player.opponent.getArenaUnits({ arena: arena })
                };
            }),
            onFalse: AbilityHelper.immediateEffects.noAction((context) => {
                return {
                    // If there are no units in play, return no legal target so the card is autoresolved.
                    hasLegalTarget: context.player.opponent.hasSomeArenaUnit(),
                };
            })
        }));
    }
}
