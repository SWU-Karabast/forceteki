import { AbilityContext } from '../core/ability/AbilityContext';
import { GameEvent } from '../core/event/GameEvent';
import { GameObject } from '../core/GameObject';
import { GameSystem, IGameSystemProperties } from '../core/gameSystem/GameSystem';
import { MetaSystem } from '../core/gameSystem/MetaSystem';


export interface ISequentialProperties<TContext extends AbilityContext = AbilityContext> extends IGameSystemProperties {
    gameSystems: GameSystem<TContext>[];
}

// TODO: fix windows and trigger timing in general
// TODO: add a variant of this (or a configuration option) for repeating the same action a variable number of times
/**
 * Meta-system used for executing a set of other systems in a sequence. Each sub-system will be executed in order,
 * one at a time, with an event window for each. ~~Triggered responses will be held until the end of the sequence,
 * except for the special cases of attacks and nested actions~~ _(this is currently buggy)_
 *
 * In terms of game text, this is the exact behavior of "do [X], then do [Y], then do..." or "do [X] [N] times"
 */
export class SequentialSystem<TContext extends AbilityContext = AbilityContext> extends MetaSystem<TContext, ISequentialProperties<TContext>> {
    public constructor(gameSystems: (GameSystem<TContext>)[]) {
        super({ gameSystems });
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
                        // TODO WINDOWS: this currently will not handle on defeat events correctly since all events are being emitted at the end of the sequential actions
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

    public override getEffectMessage(context: TContext): [string, any] {
        const properties = super.generatePropertiesFromContext(context);
        return properties.gameSystems[0].getEffectMessage(context);
    }

    public override generatePropertiesFromContext(context: TContext, additionalProperties = {}) {
        const properties = super.generatePropertiesFromContext(context, additionalProperties);
        for (const gameSystem of properties.gameSystems) {
            gameSystem.setDefaultTargetFn(() => properties.target);
        }
        return properties;
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

    // TODO: refactor GameSystem so this class doesn't need to override this method (it isn't called since we override hasLegalTarget)
    protected override isTargetTypeValid(target: any): boolean {
        return false;
    }
}
