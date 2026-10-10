import type { IGameSystemInput } from './GameSystem';
import type { AbilityContext } from '../ability/AbilityContext';
import { GameStateChangeRequired } from '../Constants';
import type { TriggerHandlingMode } from '../event/EventWindow';
import type { GameEvent } from '../event/GameEvent';
import type { GameObject } from '../GameObject';
import type { Player } from '../Player';
import { Helpers } from '../utils/Helpers';
import { GameSystem, type IGameSystemProperties } from './GameSystem';

export interface IPlayerTargetSystemProperties extends IGameSystemProperties {
    target: Player[];
}

/**
 * A {@link GameSystem} which targets a player for its effect
 */
export abstract class PlayerTargetSystem<TContext extends AbilityContext = AbilityContext, TProperties extends IPlayerTargetSystemProperties = IPlayerTargetSystemProperties> extends GameSystem<TContext, TProperties> {
    protected override generateEventInternal(context: TContext, properties: TProperties, addLastKnownInformation = false, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}): GameEvent {
        const target = properties.target.length === 1 ? properties.target[0] : properties.target;
        return this.generateRetargetedEventWithProperties(target, context, properties, additionalProperties);
    }

    protected override isTargetTypeValid(target: GameObject | GameObject[]): boolean {
        const targetAra = Helpers.asArray(target);

        return targetAra.length > 0 && targetAra.every((targetItem) => targetItem.isPlayer());
    }

    public override defaultTargets(context: TContext): Player[] {
        return context.player ? [context.player.opponent] : [];
    }

    protected override checkEventConditionInternal(event, properties: TProperties, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}): boolean {
        return this.canAffectWithProperties(event.player, event.context, properties, GameStateChangeRequired.MustFullyOrPartiallyResolve, additionalProperties);
    }

    // override to force the argument type to be Player
    protected override canAffectInternal(target: Player | Player[], context: TContext, properties: TProperties, mustChangeGameState: GameStateChangeRequired): boolean {
        return super.canAffectInternal(target, context, properties, mustChangeGameState);
    }

    // override to force the argument type to be Player
    public override resolve(target: undefined | Player | Player[], context: TContext, triggerHandlingMode?: TriggerHandlingMode) {
        super.resolve(target, context, triggerHandlingMode);
    }

    // override to force the argument type to be Player
    protected override updateEvent(event: GameEvent, player: Player, context: TContext, properties: TProperties, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}): void {
        super.updateEvent(event, player, context, properties, additionalProperties);
    }

    // override to force the argument type to be Player
    protected override createEvent(player: Player, context: TContext, properties: TProperties) {
        return super.createEvent(player, context, properties);
    }

    protected override addPropertiesToEvent(event, player: Player, context: TContext, properties: TProperties): void {
        super.addPropertiesToEvent(event, player, context, properties);
        event.player = player;
    }
}
