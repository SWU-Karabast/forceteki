import type { IGameSystemInput } from '../core/gameSystem/GameSystem';
import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import type { GameStateChangeRequired } from '../core/Constants';
import { MetaEventName } from '../core/Constants';
import type { GameEvent } from '../core/event/GameEvent';
import { CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import { DrawSpecificCardSystem } from './DrawSpecificCardSystem';
import { RevealSystem, type IRevealProperties } from './RevealSystem';
import { SimultaneousSystem } from './SimultaneousSystem';
import { Helpers } from '../core/utils/Helpers';
import { ChatHelpers } from '../core/chat/ChatHelpers';
import type { FormatMessage } from '../core/chat/GameChat';
import type { ResolutionMode } from './SimultaneousOrSequentialSystem';

export type IRevealAndDrawProperties = IRevealProperties & {
    resolutionMode?: ResolutionMode;
};

export class RevealAndDrawSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IRevealAndDrawProperties> {
    public override readonly name = 'revealAndDraw';
    public override readonly eventName = MetaEventName.RevealAndDrawCard;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected override eventHandlerInternal(): void { }

    protected override getEffectMessageInternal(context: TContext, properties: IRevealAndDrawProperties): [string, any[]] {
        const targetsArray = Helpers.asArray(properties.target);
        const targetMessage: FormatMessage = {
            format: ChatHelpers.formatWithLength(targetsArray.length),
            args: targetsArray
        };

        return [
            'reveal and draw {0}',
            [targetMessage]
        ];
    }

    protected override canAffectInternal(card: Card, context: TContext, properties: IRevealAndDrawProperties, mustChangeGameState: GameStateChangeRequired, additionalProperties: Partial<IGameSystemInput<IRevealAndDrawProperties>> = {}): boolean {
        return this.generateSimultaneousSystem(context, additionalProperties)
            .canAffect(card, context, additionalProperties, mustChangeGameState);
    }

    protected override queueGenerateEventGameStepsInternal(events: GameEvent[], context: TContext, properties: IRevealAndDrawProperties, additionalProperties: Partial<IGameSystemInput<IRevealAndDrawProperties>> = {}): void {
        this.generateSimultaneousSystem(context, additionalProperties)
            .queueGenerateEventGameSteps(events, context);
    }

    private generateSimultaneousSystem(
        context: TContext,
        additionalProperties: Partial<IGameSystemInput<IRevealAndDrawProperties>> = {}
    ): SimultaneousSystem<TContext> {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        return new SimultaneousSystem<TContext>({
            resolutionMode: properties.resolutionMode,
            gameSystems: [
                new RevealSystem<TContext>(properties),
                new DrawSpecificCardSystem<TContext>({
                    target: properties.target,
                })
            ]
        });
    }
}