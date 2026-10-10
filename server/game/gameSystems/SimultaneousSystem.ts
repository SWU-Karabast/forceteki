import type { IGameSystemInput } from '../core/gameSystem/GameSystem';
import type { AbilityContext } from '../core/ability/AbilityContext';
import type { MetaEventName } from '../core/Constants';
import { Contract } from '../core/utils/Contract';
import { Helpers } from '../core/utils/Helpers';
import { ChatHelpers } from '../core/chat/ChatHelpers';
import type { GameSystem } from '../core/gameSystem/GameSystem';
import type { ISimultaneousOrSequentialSystemProperties } from './SimultaneousOrSequentialSystem';
import { ResolutionMode, SimultaneousOrSequentialSystem } from './SimultaneousOrSequentialSystem';
import type { GameEvent } from '../core/event/GameEvent';

export type ISimultaneousSystemProperties<TContext extends AbilityContext = AbilityContext> = ISimultaneousOrSequentialSystemProperties<TContext>;

export class SimultaneousSystem<TContext extends AbilityContext = AbilityContext> extends SimultaneousOrSequentialSystem<ISimultaneousSystemProperties<TContext>, TContext> {
    public override readonly eventName: MetaEventName.Simultaneous;

    protected override getEffectMessageInternal(context: TContext, properties: ISimultaneousSystemProperties<TContext>, additionalProperties: Partial<IGameSystemInput<ISimultaneousSystemProperties<TContext>>> = {}): [string, any[]] {
        const { gameSystems } = properties;
        const legalSystems = gameSystems.filter((system) => system.hasLegalTarget(context, additionalProperties));
        const message = ChatHelpers.formatWithLength(legalSystems.length, 'to ');
        const legalSystemsMessages = legalSystems.map((system) => {
            const [format, args] = system.getEffectMessage(context, additionalProperties);
            return {
                format: format,
                args: args
            };
        });

        // Don't show anything if there are no legal systems or none of them have messages
        if (legalSystemsMessages.length === 0 || legalSystemsMessages.every((msg) => msg.format === '')) {
            return super.getEffectMessageInternal(context, properties, additionalProperties);
        }

        return [message, legalSystemsMessages];
    }

    protected override queueGenerateEventGameStepsInternal(events: GameEvent[], context: TContext, properties: ISimultaneousSystemProperties<TContext>, additionalProperties: Partial<IGameSystemInput<ISimultaneousSystemProperties<TContext>>> = {}): void {
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
