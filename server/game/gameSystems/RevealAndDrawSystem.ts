import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import type { GameStateChangeRequired } from '../core/Constants';
import { MetaEventName } from '../core/Constants';
import type { GameEvent } from '../core/event/GameEvent';
import { CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import { DrawSpecificCardSystem } from './DrawSpecificCardSystem';
import { RevealSystem, type IRevealProperties } from './RevealSystem';
import { SimultaneousSystem } from './SimultaneousSystem';
import * as Helpers from '../core/utils/Helpers';
import * as ChatHelpers from '../core/chat/ChatHelpers';
import type { FormatMessage } from '../core/chat/GameChat';
import type { ResolutionMode } from './SimultaneousOrSequentialSystem';

export type IRevealAndDrawProperties = IRevealProperties & {
    resolutionMode?: ResolutionMode;
};

export class RevealAndDrawSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IRevealAndDrawProperties> {
    public override readonly name = 'revealAndDraw';
    public override readonly eventName = MetaEventName.RevealAndDrawCard;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override eventHandler(event): void { }

    public override getEffectMessage(context: TContext, additionalProperties?: Partial<IRevealProperties>): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
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

    public override canAffectInternal(
        card: Card,
        context: TContext,
        additionalProperties?: Partial<IRevealProperties>,
        mustChangeGameState?: GameStateChangeRequired
    ): boolean {
        return this.generateSimultaneousSystem(context, additionalProperties)
            .canAffectInternal(card, context, additionalProperties, mustChangeGameState);
    }

    public override queueGenerateEventGameSteps(
        events: GameEvent[],
        context: TContext,
        additionalProperties?: Partial<IRevealProperties>
    ): void {
        this.generateSimultaneousSystem(context, additionalProperties)
            .queueGenerateEventGameSteps(events, context);
    }

    private generateSimultaneousSystem(
        context: TContext,
        additionalProperties: Partial<IRevealAndDrawProperties> = {}
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