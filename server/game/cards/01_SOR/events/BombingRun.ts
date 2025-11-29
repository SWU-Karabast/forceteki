import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { Arena } from '../../../core/Constants';
import { TargetMode, ZoneName } from '../../../core/Constants';

export default class BombingRun extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7916724925',
            internalName: 'bombing-run',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Deal 3 damage to each unit in an arena',
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
            onTrue: AbilityHelper.immediateEffects.damage((context) => {
                return {
                    amount: 3,
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
