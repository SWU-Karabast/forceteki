import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { Arena } from '../../../core/Constants';
import { TargetMode, ZoneName } from '../../../core/Constants';

export default class Outmaneuver extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7366340487',
            internalName: 'outmaneuver',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Exhaust each unit in an arena',
            targetResolver: {
                mode: TargetMode.Select,
                activePromptTitle: 'Choose an arena',
                choices: {
                    ['Ground']: this.eventEffect(ZoneName.GroundArena, AbilityHelper),
                    ['Space']: this.eventEffect(ZoneName.SpaceArena, AbilityHelper),
                }
            }
        });
    }

    private eventEffect(arena: Arena, AbilityHelper: IAbilityHelper) {
        return AbilityHelper.immediateEffects.conditional((context) => ({
            condition: context.game.getPlayers().some((player) => player.hasSomeArenaUnit({ arena: arena })),
            onTrue: AbilityHelper.immediateEffects.exhaust((context) => {
                return {
                    target: context.game.getPlayers().reduce((units, player) => units.concat(player.getArenaUnits({ arena: arena })), [])
                };
            }),
            onFalse: AbilityHelper.immediateEffects.noAction((context) => {
                return {
                    // If there are no units in play, return no legal target so the card is autoresolved.
                    hasLegalTarget: context.game.getPlayers().some((player) => player.hasSomeArenaUnit())
                };
            })
        }));
    }
}
