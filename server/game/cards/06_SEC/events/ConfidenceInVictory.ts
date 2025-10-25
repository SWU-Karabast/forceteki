import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import type { Arena } from '../../../core/Constants';
import { PhaseName, TargetMode, ZoneName } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { ActionsThisPhaseWatcher } from '../../../stateWatchers/ActionsThisPhaseWatcher';

export default class ConfidenceInVictory extends EventCard {
    private actionsThisPhaseWatcher: ActionsThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '4234231959',
            internalName: 'confidence-in-victory',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.actionsThisPhaseWatcher = AbilityHelper.stateWatchers.actionsThisPhase();
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.addPlayRestrictionAbility({
            title: 'Play only as your first action in the action phase',
            restrictedActionCondition: (context, card) =>
                this.actionsThisPhaseWatcher.playerHasTakenAction(context.player) ||
                context.source !== card // Ensures it cannot be played by other card effects
        });

        registrar.setEventAbility({
            title: 'Choose an arena. At the start of the regroup phase, if you are the only person who controls units in that arena, you win the game.',
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
        return AbilityHelper.immediateEffects.delayedPlayerEffect({
            title: 'You win the game',
            effectDescription: `win the game at the start of the next regroup phase if they are the only player who controls units in the ${arena === ZoneName.SpaceArena ? 'Space' : 'Ground'} Arena`,
            when: {
                onPhaseStarted: (context) => context.phase === PhaseName.Regroup,
            },
            immediateEffect: AbilityHelper.immediateEffects.conditional((context) => ({
                condition: context.player.getArenaUnits({ arena: arena }).length > 0 &&
                  context.player.opponent.getArenaUnits({ arena: arena }).length === 0,
                onTrue: AbilityHelper.immediateEffects.winGame({
                    target: context.player,
                    winReason: `as the only player with units in the ${arena === ZoneName.SpaceArena ? 'Space' : 'Ground'} Arena`,
                })
            }))
        });
    }
}