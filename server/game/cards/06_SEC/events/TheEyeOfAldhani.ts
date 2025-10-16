import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { PhaseName, RelativePlayer, TargetMode, WildcardCardType } from '../../../core/Constants';

export default class TheEyeOfAldhani extends EventCard {
    protected override getImplementationId () {
        return {
            id: 'the-eye-of-aldhani-id',
            internalName: 'the-eye-of-aldhani',
        };
    }

    public override setupCardAbilities (registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'At the start of the next action phase, for each enemy unit, its controller must pay 1 Resource or exhaust that unit.',
            immediateEffect: abilityHelper.immediateEffects.delayedPlayerEffect((delayedContext) => ({
                title: 'For each enemy unit, its controller must pay 1 Resource or exhaust that unit',
                target: delayedContext.player.opponent,
                when: {
                    onPhaseStarted: (context) => context.phase === PhaseName.Action
                },
                immediateEffect: abilityHelper.immediateEffects.selectCard({
                    mode: TargetMode.UpToVariable,
                    cardTypeFilter: WildcardCardType.Unit,
                    choosingPlayer: RelativePlayer.Opponent,
                    controller: RelativePlayer.Opponent,
                    activePromptTitle: (context) => {
                        const upUnits = Math.min(context.player.opponent.resources.length, context.player.opponent.getArenaUnits().length);
                        return `Select up to ${upUnits} units and pay 1 resource for each of them to keep them ready`;
                    },
                    numCardsFunc: (context) => Math.min(context.player.opponent.resources.length, context.player.opponent.getArenaUnits().length),
                    immediateEffect: abilityHelper.immediateEffects.simultaneous([
                        abilityHelper.immediateEffects.exhaust((context) => ({
                            target: context.player.opponent.getArenaUnits({ condition: (card) => !context.targets.target.includes(card) }),
                        })),
                        abilityHelper.immediateEffects.payResourceCost((context) => ({
                            amount: context.targets.target.length,
                            target: context.player.opponent,
                        })),
                    ])
                })
            }))
        });
    }
}
