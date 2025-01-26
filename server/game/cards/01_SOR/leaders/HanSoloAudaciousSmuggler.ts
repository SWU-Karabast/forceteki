import AbilityHelper from '../../../AbilityHelper';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { PhaseName, RelativePlayer, ZoneName } from '../../../core/Constants';
import type { GameSystem } from '../../../core/gameSystem/GameSystem';

export default class HanSoloAudaciousSmuggler extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5954056864',
            internalName: 'han-solo#audacious-smuggler',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Put a card from your hand into play as a resource and ready it. At the start of the next action phase, defeat a resource you control.',
            cost: AbilityHelper.costs.exhaustSelf(),
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.selectCard({
                    controller: RelativePlayer.Self,
                    zoneFilter: ZoneName.Hand,
                    innerSystem: AbilityHelper.immediateEffects.resourceCard({
                        readyResource: true
                    })
                }),
                AbilityHelper.immediateEffects.delayedPlayerEffect({
                    title: 'Defeat a resource you control',
                    when: {
                        onPhaseStarted: (context) => context.phase === PhaseName.Action, // Should we make some sort of short-hand/easier way for this?
                    },
                    immediateEffect: AbilityHelper.immediateEffects.selectCard({
                        controller: RelativePlayer.Self,
                        zoneFilter: ZoneName.Resource,
                        innerSystem: AbilityHelper.immediateEffects.defeat()
                    })
                })
            ])
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addOnAttackAbility({
            title: 'Put the top card of your deck into play as a resource and ready it. At the start of the next action phase, defeat a resource you control.',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.resourceCard((context) => ({
                    target: context.player.getTopCardOfDeck(),
                    readyResource: true
                })),
                AbilityHelper.immediateEffects.delayedPlayerEffect({
                    title: 'Defeat a resource you control',
                    when: {
                        onPhaseStarted: (context) => context.phase === PhaseName.Action, // Should we make some sort of short-hand/easier way for this?
                    },
                    immediateEffect: AbilityHelper.immediateEffects.selectCard({
                        controller: RelativePlayer.Self,
                        zoneFilter: ZoneName.Resource,
                        innerSystem: AbilityHelper.immediateEffects.defeat()
                    })
                })
            ])
        });
    }

    private buildHanResourceDefeat(): GameSystem<TriggeredAbilityContext<this>> {
        return AbilityHelper.immediateEffects.delayedPlayerEffect({
            title: 'Defeat a resource you control',
            when: {
                onPhaseStarted: (context) => context.phase === PhaseName.Action, // Should we make some sort of short-hand/easier way for this?
            },
            immediateEffect: AbilityHelper.immediateEffects.selectCard({
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Resource,
                innerSystem: AbilityHelper.immediateEffects.defeat()
            })
        });
    }
}

HanSoloAudaciousSmuggler.implemented = true;
