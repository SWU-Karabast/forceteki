import type { IGameSystemInput } from '../core/gameSystem/GameSystem';
import type { AbilityContext } from '../core/ability/AbilityContext';
import { EventName, GameStateChangeRequired } from '../core/Constants';
import type { GameEvent } from '../core/event/GameEvent';
import type { ILastingEffectPropertiesBase } from '../core/gameSystem/LastingEffectPropertiesBase';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import type { Player } from '../core/Player';
import { type DistributiveOmit, Helpers } from '../core/utils/Helpers';
import * as LastingEffectSystemHelpers from './helpers/LastingEffectSystemHelpers';
import type { IOngoingPlayerEffectGenerator, IOngoingPlayerEffectProps } from '../Interfaces';

export type IPlayerLastingEffectProperties = DistributiveOmit<ILastingEffectPropertiesBase, 'target' | 'effect'> & Pick<IPlayerTargetSystemProperties, 'target'> & {
    effect: IOngoingPlayerEffectGenerator | IOngoingPlayerEffectGenerator[];
};

export class PlayerLastingEffectSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, IPlayerLastingEffectProperties> {
    public override readonly name: string = 'applyPlayerLastingEffect';
    public override readonly eventName: EventName = EventName.OnEffectApplied;

    protected override eventHandlerInternal(event): void {
        /* eslint-disable @typescript-eslint/prefer-for-of */
        const propsArray = Helpers.asArray(event.effectProperties) as IOngoingPlayerEffectProps[];
        const factories = event.effectFactories as IOngoingPlayerEffectGenerator[];
        const effects: ReturnType<IOngoingPlayerEffectGenerator>[] = [];

        for (let i = 0; i < propsArray.length; i++) {
            for (let j = 0; j < factories.length; j++) {
                effects.push(factories[j](event.context.game, event.context.source, propsArray[i]));
            }
        }

        for (let i = 0; i < effects.length; i++) {
            event.context.game.ongoingEffectEngine.add(effects[i]);
        }
        /* eslint-enable @typescript-eslint/prefer-for-of */
    }

    protected override addPropertiesToEvent(event: any, target: Player, context: TContext, properties: IPlayerLastingEffectProperties, additionalProperties: Partial<IGameSystemInput<IPlayerLastingEffectProperties>> = {}): void {
        super.addPropertiesToEvent(event, target, context, properties);

        const { effectFactories, effectProperties } = this.getEffectFactoriesAndProperties(target, context, additionalProperties);

        event.effectFactories = effectFactories;
        event.effectProperties = effectProperties;
    }

    private getEffectFactoriesAndProperties(target: Player, context: TContext, additionalProperties?: Partial<IGameSystemInput<IPlayerLastingEffectProperties>>): { effectFactories: IOngoingPlayerEffectGenerator[]; effectProperties: IOngoingPlayerEffectProps };
    private getEffectFactoriesAndProperties(target: Player[], context: TContext, additionalProperties?: Partial<IGameSystemInput<IPlayerLastingEffectProperties>>): { effectFactories: IOngoingPlayerEffectGenerator[]; effectProperties: IOngoingPlayerEffectProps[] };
    private getEffectFactoriesAndProperties(target: Player | Player[], context: TContext, additionalProperties?: Partial<IGameSystemInput<IPlayerLastingEffectProperties>>): { effectFactories: IOngoingPlayerEffectGenerator[]; effectProperties: IOngoingPlayerEffectProps | IOngoingPlayerEffectProps[] };
    private getEffectFactoriesAndProperties(target: Player | Player[], context: TContext, additionalProperties?: Partial<IGameSystemInput<IPlayerLastingEffectProperties>>): { effectFactories: IOngoingPlayerEffectGenerator[]; effectProperties: IOngoingPlayerEffectProps | IOngoingPlayerEffectProps[] } {
        const { effect, ...otherProperties } = this.generatePropertiesFromContext(context, additionalProperties);

        const effectProperties: (target: Player) => IOngoingPlayerEffectProps = (target) => ({ matchTarget: target, isLastingEffect: true, ability: context.ability, ...otherProperties });

        if (Array.isArray(target)) {
            return { effectFactories: Helpers.asArray(effect), effectProperties: target.map((target) => effectProperties(target)) };
        }

        return { effectFactories: Helpers.asArray(effect), effectProperties: effectProperties(target as Player) };
    }

    protected override hasLegalTargetInternal(context: TContext, properties: IPlayerLastingEffectProperties, mustChangeGameState = GameStateChangeRequired.None, additionalProperties: Partial<IGameSystemInput<IPlayerLastingEffectProperties>> = {}): boolean {
        return properties.effect.length > 0 && super.hasLegalTargetInternal(context, properties, mustChangeGameState, additionalProperties);
    }

    protected override queueGenerateEventGameStepsInternal(events: GameEvent[], context: TContext, properties: IPlayerLastingEffectProperties, additionalProperties: Partial<IGameSystemInput<IPlayerLastingEffectProperties>> = {}): void {
        if (this.hasLegalTarget(context, additionalProperties)) {
            events.push(this.generateEvent(context, additionalProperties));
        }
    }

    public override defaultTargets(context: TContext): Player[] {
        return context.player ? [context.player] : [];
    }

    protected override getEffectMessageInternal(context: TContext, properties: IPlayerLastingEffectProperties, additionalProperties: Partial<IGameSystemInput<IPlayerLastingEffectProperties>> = {}): [string, any[]] {
        return LastingEffectSystemHelpers.getEffectMessage(
            this,
            context,
            properties,
            additionalProperties,
            (target, context, additionalProps) => this.getEffectFactoriesAndProperties(target, context, additionalProps)
        );
    }
}
