import type { IAbilityHelper } from '../../../AbilityHelper';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { GameStateChangeRequired, PhaseName, RelativePlayer, ZoneName } from '../../../core/Constants';
import type { GameSystem } from '../../../core/gameSystem/GameSystem';

export default class HanSoloAudaciousSmuggler extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5954056864',
            internalName: 'han-solo#audacious-smuggler',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Put a card from your hand into play as a resource and ready it. At the start of the next action phase, defeat a resource you control.',
            cost: AbilityHelper.costs.exhaustSelf(),
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.selectCard({
                    controller: RelativePlayer.Self,
                    zoneFilter: ZoneName.Hand,
                    mustChangeGameState: GameStateChangeRequired.MustFullyResolve,
                    effect: 'put a card from their hand into play as a ready resource',
                    immediateEffect: AbilityHelper.immediateEffects.resourceCard({
                        readyResource: true
                    })
                }),
                this.buildHanDelayedEffect(AbilityHelper)
            ])
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Put the top card of your deck into play as a resource and ready it. At the start of the next action phase, defeat a resource you control.',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.resourceCard((context) => ({
                    target: context.player.getTopCardOfDeck(),
                    readyResource: true
                })),
                this.buildHanDelayedEffect(AbilityHelper)
            ])
        });
    }

    private buildHanDelayedEffect(AbilityHelper: IAbilityHelper): GameSystem<TriggeredAbilityContext<this>> {
        const defaultActivePromptTitle = 'Choose a resource to defeat';
        return AbilityHelper.immediateEffects.delayedPlayerEffect({
            title: 'Defeat a resource you control',
            when: {
                onPhaseStarted: (context) => context.phase === PhaseName.Action, // Should we make some sort of short-hand/easier way for this?
            },
            effectDescription: 'defeat a resource at the start of the next action phase',
            immediateEffect: AbilityHelper.immediateEffects.selectCard({
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Resource,
                mustChangeGameState: GameStateChangeRequired.MustFullyResolve,
                activePromptTitle: (context) => (context.source.controller.exhaustedResourceCount === 0 ? defaultActivePromptTitle : `${defaultActivePromptTitle}. The resource you choose will automatically be switched to exhausted before it is defeated (you will not lose any ready resources).`),
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            })
        });
    }
}

