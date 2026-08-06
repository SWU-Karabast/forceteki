import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { Arena } from '../../../core/Constants';
import { AbilityType, TargetMode, ZoneName } from '../../../core/Constants';

export default class TreacherousMinefield extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3174645451',
            internalName: 'treacherous-minefield',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Give each unit in an arena "On Attack: Deal 2 damage to this unit"',
            targetResolver: {
                mode: TargetMode.Select,
                activePromptTitle: 'Choose an arena',
                choices: {
                    ['Space']: this.eventEffect(ZoneName.SpaceArena, AbilityHelper),
                    ['Ground']: this.eventEffect(ZoneName.GroundArena, AbilityHelper),
                }
            }
        });
    }

    private eventEffect(arena: Arena, AbilityHelper: IAbilityHelper) {
        return AbilityHelper.immediateEffects.conditional((context) => ({
            condition: context.game.getPlayers().some((player) => player.hasSomeArenaUnit({ arena: arena })),
            onTrue: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                effect: [
                    AbilityHelper.ongoingEffects.gainAbility({
                        type: AbilityType.Triggered,
                        title: 'Deal 2 damage to this unit',
                        when: { onAttack: true },
                        immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
                    })
                ],
                target: context.game.getArenaUnits({ arena: arena })
            })),
            onFalse: AbilityHelper.immediateEffects.noAction((context) => {
                return {
                    // If there are no units in play, return no legal target so the card is autoresolved.
                    hasLegalTarget: context.game.getPlayers().some((player) => player.hasSomeArenaUnit())
                };
            })
        }));
    }
}