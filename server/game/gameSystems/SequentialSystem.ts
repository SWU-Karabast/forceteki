import { AbilityContext } from '../core/ability/AbilityContext';
import { GameEvent } from '../core/event/GameEvent';
import { GameObject } from '../core/GameObject';
import { GameSystem, IGameSystemProperties } from '../core/gameSystem/GameSystem';

export interface ISequentialProperties extends IGameSystemProperties {
    gameSystems: GameSystem[];
}

export class SequentialSystem extends GameSystem<ISequentialProperties> {
    public constructor(gameSystems: GameSystem[]) {
        super({ gameSystems: gameSystems });
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override eventHandler() {}

    public override queueGenerateEventGameSteps(events: GameEvent[], context: AbilityContext, additionalProperties = {}): void {
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
                            context.game.openThenEventWindow(eventsForThisAction);
                        }
                    }, `open event window for sequential system ${gameSystem.name}`);
                }
            }, `check and add events for sequential system ${gameSystem.name}`);
        }
    }

    public override getEffectMessage(context: AbilityContext): [string, any] {
        const properties = super.generatePropertiesFromContext(context) as ISequentialProperties;
        return properties.gameSystems[0].getEffectMessage(context);
    }

    public override generatePropertiesFromContext(context: AbilityContext, additionalProperties = {}): ISequentialProperties {
        const properties = super.generatePropertiesFromContext(context, additionalProperties) as ISequentialProperties;
        for (const gameSystem of properties.gameSystems) {
            gameSystem.setDefaultTargetFn(() => properties.target);
        }
        return properties;
    }

    public override hasLegalTarget(context: AbilityContext, additionalProperties = {}): boolean {
        const { gameSystems } = this.generatePropertiesFromContext(context, additionalProperties);
        return gameSystems.some((gameSystem) => gameSystem.hasLegalTarget(context));
    }

    public override canAffect(target: GameObject, context: AbilityContext, additionalProperties = {}): boolean {
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
