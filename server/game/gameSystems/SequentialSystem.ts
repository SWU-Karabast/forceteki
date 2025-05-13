import type { AbilityContext } from '../core/ability/AbilityContext';
import { type MetaEventName } from '../core/Constants';
import type { GameEvent } from '../core/event/GameEvent';
import type { GameSystem } from '../core/gameSystem/GameSystem';
import * as Contract from '../core/utils/Contract';
import * as Helpers from '../core/utils/Helpers';
import type { ISimultaneousOrSequentialSystemProperties } from './SimultaneousOrSequentialSystem';
import { ResolutionMode, SimultaneousOrSequentialSystem } from './SimultaneousOrSequentialSystem';

export type ISequentialSystemProperties<TContext extends AbilityContext = AbilityContext> = ISimultaneousOrSequentialSystemProperties<TContext>;


// TODO: add a variant of this (or a configuration option) for repeating the same action a variable number of times
/**
 * Meta-system used for executing a set of other systems in a sequence. Each sub-system will be executed in order,
 * one at a time, with an event window for each. ~~Triggered responses will be held until the end of the sequence,
 * except for the special cases of attacks and nested actions~~ _(this is currently buggy)_
 *
 * In terms of game text, this is the exact behavior of "do [X], then do [Y], then do..." or "do [X] [N] times"
 */
export class SequentialSystem<TContext extends AbilityContext = AbilityContext> extends SimultaneousOrSequentialSystem< ISequentialSystemProperties<TContext>, TContext> {
    protected override readonly eventName: MetaEventName.Sequential;

    public override getEffectMessage(context: TContext): [string, any] {
        const properties = super.generatePropertiesFromContext(context);
        return properties.gameSystems[0].getEffectMessage(context);
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties: Partial<ISequentialSystemProperties<TContext>> = {}): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        let queueGenerateEventGameStepsFn: (gameSystem: GameSystem<TContext>, events: GameEvent[]) => () => boolean;
        let generateStepName: (gameSystem: GameSystem<TContext>) => string;

        if (properties.resolutionMode === ResolutionMode.AlwaysResolve) {
            queueGenerateEventGameStepsFn = (gameSystem: GameSystem<TContext>, eventsForThisAction: GameEvent[]) => () => {
                gameSystem.queueGenerateEventGameSteps(eventsForThisAction, context, additionalProperties);
                return true;
            };
            generateStepName = (gameSystem: GameSystem<TContext>) => `add events for sequential system  ${gameSystem.name}`;
        } else {
            // Exit early if we are enforcing targeting and there are no targets (e.g. when the user picks "Choose nothing")
            if (properties.resolutionMode === ResolutionMode.AllGameSystemsMustBeLegal && !this.allTargetsLegal(context, additionalProperties) && Helpers.asArray(properties.target).length === 0) {
                return;
            }
            Contract.assertFalse(
                properties.resolutionMode === ResolutionMode.AllGameSystemsMustBeLegal && !this.allTargetsLegal(context, additionalProperties),
                `Attempting to trigger sequential system with enforceTargeting set to true, but not all game systems are legal. Systems: ${properties.gameSystems.map((gameSystem) => gameSystem.name).join(', ')}`
            );
            queueGenerateEventGameStepsFn = (gameSystem: GameSystem<TContext>, eventsForThisAction: GameEvent[]) => () => {
                if (gameSystem.hasLegalTarget(context, additionalProperties)) {
                    gameSystem.queueGenerateEventGameSteps(eventsForThisAction, context, additionalProperties);
                    return true;
                }
                return false;
            };
            generateStepName = (gameSystem: GameSystem<TContext>) => `check targets and add events for sequential system ${gameSystem.name}`;
        }

        for (const gameSystem of properties.gameSystems) {
            context.game.queueSimpleStep(() => {
                const eventsForThisAction = [];
                if (queueGenerateEventGameStepsFn(gameSystem, eventsForThisAction)()) {
                    context.game.queueSimpleStep(() => {
                        for (const event of eventsForThisAction) {
                            events.push(event);
                        }
                        if (gameSystem !== properties.gameSystems[properties.gameSystems.length - 1]) {
                            context.game.openEventWindow(eventsForThisAction);
                        }
                    }, `open event window for sequential system ${gameSystem.name}`);
                }
            }, generateStepName(gameSystem));
        }
    }
}
