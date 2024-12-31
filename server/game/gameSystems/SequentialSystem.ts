import type { AbilityContext } from '../core/ability/AbilityContext';
import type { MetaEventName } from '../core/Constants';
import type { GameEvent } from '../core/event/GameEvent';
import type { GameObject } from '../core/GameObject';
import type { GameSystem, IGameSystemProperties } from '../core/gameSystem/GameSystem';
import type { ISystemArrayOrFactory } from '../core/gameSystem/AggregateSystem';
import { AggregateSystem } from '../core/gameSystem/AggregateSystem';


export interface ISequentialSystemProperties<TContext extends AbilityContext = AbilityContext> extends IGameSystemProperties {
    gameSystems: GameSystem<TContext>[];
}

// TODO: add a variant of this (or a configuration option) for repeating the same action a variable number of times
/**
 * Meta-system used for executing a set of other systems in a sequence. Each sub-system will be executed in order,
 * one at a time, with an event window for each. ~~Triggered responses will be held until the end of the sequence,
 * except for the special cases of attacks and nested actions~~ _(this is currently buggy)_
 *
 * In terms of game text, this is the exact behavior of "do [X], then do [Y], then do..." or "do [X] [N] times"
 */
export class SequentialSystem<TContext extends AbilityContext = AbilityContext> extends AggregateSystem<TContext, ISequentialSystemProperties<TContext>> {
    protected override readonly eventName: MetaEventName.Sequential;
    public constructor(gameSystems: ISystemArrayOrFactory<TContext>) {
        if (typeof gameSystems === 'function') {
            super((context: TContext) => ({ gameSystems: gameSystems(context) }));
        } else {
            super({ gameSystems });
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override eventHandler() {}

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties = {}): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        for (const gameSystem of properties.gameSystems) {
            context.game.queueSimpleStep(() => {
                if (gameSystem.hasLegalTarget(context, additionalProperties)) {
                    const eventsForThisAction = [];
                    gameSystem.queueGenerateEventGameSteps(eventsForThisAction, context, additionalProperties);
                    context.game.queueSimpleStep(() => {
                        for (const event of eventsForThisAction) {
                            events.push(event);
                        }
                        if (gameSystem !== properties.gameSystems[properties.gameSystems.length - 1]) {
                            context.game.openEventWindow(eventsForThisAction);
                        }
                    }, `open event window for sequential system ${gameSystem.name}`);
                }
            }, `check and add events for sequential system ${gameSystem.name}`);
        }
    }

    public override getInnerSystems(properties: ISequentialSystemProperties<TContext>) {
        return properties.gameSystems;
    }

    public override getEffectMessage(context: TContext): [string, any] {
        const properties = super.generatePropertiesFromContext(context);
        return properties.gameSystems[0].getEffectMessage(context);
    }

    public override hasLegalTarget(context: TContext, additionalProperties = {}): boolean {
        const { gameSystems } = this.generatePropertiesFromContext(context, additionalProperties);
        return gameSystems.some((gameSystem) => gameSystem.hasLegalTarget(context));
    }

    public override canAffect(target: GameObject, context: TContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return properties.gameSystems.some((gameSystem) => gameSystem.canAffect(target, context));
    }

    public override hasTargetsChosenByInitiatingPlayer(context, additionalProperties = {}) {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return properties.gameSystems.some((gameSystem) =>
            gameSystem.hasTargetsChosenByInitiatingPlayer(context, additionalProperties)
        );
    }
}
