import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { PhaseName, RelativePlayer, TargetMode, WildcardCardType } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class TheEyeOfAldhani extends EventCard {
    protected override getImplementationId () {
        return {
            id: '3828763910',
            internalName: 'the-eye-of-aldhani',
        };
    }

    public override setupCardAbilities (registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: `At the start of the next action phase, for each enemy unit, its controller must pay ${TextHelper.resource(1)} or exhaust that unit.`,
            immediateEffect: abilityHelper.immediateEffects.delayedPlayerEffect((delayedContext) => ({
                title: `For each enemy unit, its controller must pay ${TextHelper.resource(1)} or exhaust that unit`,
                target: delayedContext.player.opponent,
                when: {
                    onPhaseStarted: (context) => context.phase === PhaseName.Action
                },
                immediateEffect: abilityHelper.immediateEffects.selectCard({
                    mode: TargetMode.UpToVariable,
                    cardTypeFilter: WildcardCardType.Unit,
                    choosingPlayer: RelativePlayer.Self,
                    controller: RelativePlayer.Self,
                    activePromptTitle: (context) => {
                        const upUnits = Math.min(context.player.resources.length, context.player.getArenaUnits().length);
                        return `Select up to ${upUnits} units and pay ${TextHelper.resource(1)} for each of them to keep them ready`;
                    },
                    numCardsFunc: (context) => Math.min(context.player.resources.length, context.player.getArenaUnits().length),
                    immediateEffect: abilityHelper.immediateEffects.simultaneous([
                        abilityHelper.immediateEffects.exhaust((context) => ({
                            target: context.player.getArenaUnits({ condition: (card) => !context.targets.target.includes(card) }),
                        })),
                        abilityHelper.immediateEffects.payResources((context) => ({
                            amount: context.targets.target.length,
                            target: context.player,
                        })),
                    ])
                })
            }))
        });
    }
}
