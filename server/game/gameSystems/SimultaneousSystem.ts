import type { AbilityContext } from '../core/ability/AbilityContext';
import type { MetaEventName } from '../core/Constants';
import * as Contract from '../core/utils/Contract';
import * as Helpers from '../core/utils/Helpers';
import * as ChatHelpers from '../core/chat/ChatHelpers';
import type { GameSystem } from '../core/gameSystem/GameSystem';
import type { ISimultaneousOrSequentialSystemProperties } from './SimultaneousOrSequentialSystem';
import { ResolutionMode, SimultaneousOrSequentialSystem } from './SimultaneousOrSequentialSystem';
import type { GameEvent } from '../core/event/GameEvent';

export type ISimultaneousSystemProperties<TContext extends AbilityContext = AbilityContext> = ISimultaneousOrSequentialSystemProperties<TContext>;

export class SimultaneousSystem<TContext extends AbilityContext = AbilityContext> extends SimultaneousOrSequentialSystem<ISimultaneousSystemProperties<TContext>, TContext> {
    public override readonly eventName: MetaEventName.Simultaneous;

    public override getEffectMessage(context: TContext): [string, any[]] {
        const { gameSystems } = this.generatePropertiesFromContext(context);
        const legalSystems = gameSystems.filter((system) => system.hasLegalTarget(context));
        const message = ChatHelpers.formatWithLength(legalSystems.length, 'to ');
        return [message, legalSystems.map((system) => {
            const [format, args] = system.getEffectMessage(context);
            return [format, ...args];
        })];
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties: Partial<ISimultaneousSystemProperties<TContext>> = {}): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        let queueGenerateEventGameStepsFn: (gameSystem: GameSystem<TContext>) => () => void;
        let generateStepName: (gameSystem: GameSystem<TContext>) => string;

        if (properties.resolutionMode === ResolutionMode.AlwaysResolve) {
            queueGenerateEventGameStepsFn = (gameSystem: GameSystem<TContext>) => () => {
                gameSystem.queueGenerateEventGameSteps(events, context, additionalProperties);
            };
            generateStepName = (gameSystem: GameSystem<TContext>) => `queue generate event game steps for ${gameSystem.name}`;
        } else {
            // Exit early if we are enforcing targeting and there are no targets (e.g. when the user picks "Choose nothing")
            if (properties.resolutionMode === ResolutionMode.AllGameSystemsMustBeLegal && !this.allTargetsLegal(context, additionalProperties) && Helpers.asArray(properties.target).length === 0) {
                return;
            }
            Contract.assertFalse(
                properties.resolutionMode === ResolutionMode.AllGameSystemsMustBeLegal && !this.allTargetsLegal(context, additionalProperties),
                `Attempting to trigger simultaneous system with enforceTargeting set to true, but not all game systems are legal. Systems: ${properties.gameSystems.map((gameSystem) => gameSystem.name).join(', ')}`
            );
            queueGenerateEventGameStepsFn = (gameSystem: GameSystem<TContext>) => () => {
                if (gameSystem.hasLegalTarget(context, additionalProperties)) {
                    gameSystem.queueGenerateEventGameSteps(events, context, additionalProperties);
                }
            };
            generateStepName = (gameSystem: GameSystem<TContext>) => `check targets and queue generate event game steps for ${gameSystem.name}`;
        }

        for (const gameSystem of properties.gameSystems) {
            // If it's a replacement effect, just add them to events and let the ReplacementEffectSystem handle them
            if (properties.replacementEffect === true) {
                gameSystem.queueGenerateEventGameSteps(
                    events,
                    context,
                    { ...additionalProperties, replacementEffect: true }
                );
            } else {
                context.game.queueSimpleStep(queueGenerateEventGameStepsFn(gameSystem), generateStepName(gameSystem));
            }
        }
    }
}
