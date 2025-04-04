import type { AbilityContext } from '../core/ability/AbilityContext';
import type { MetaEventName } from '../core/Constants';
import * as Contract from '../core/utils/Contract';
import { GameStateChangeRequired } from '../core/Constants';
import type { GameObject } from '../core/GameObject';
import type { GameSystem, IGameSystemProperties } from '../core/gameSystem/GameSystem';
import type { ISystemArrayOrFactory } from '../core/gameSystem/AggregateSystem';
import { AggregateSystem } from '../core/gameSystem/AggregateSystem';

export interface ISimultaneousSystemProperties<TContext extends AbilityContext = AbilityContext> extends IGameSystemProperties {
    gameSystems: GameSystem<TContext>[];

    /**
     * If this is set to true, we will assume every system has a legal target and trigger it.
     * Needed for situations where there currently isn't a target but an earlier system in the chain will create one.
     */
    ignoreTargetingRequirements?: boolean;

    // If true, all game systems must be legal for the entire "simultaneous" to be legal
    everyGameSystemMustBeLegal?: boolean;
}

export class SimultaneousGameSystem<TContext extends AbilityContext = AbilityContext> extends AggregateSystem<TContext, ISimultaneousSystemProperties<TContext>> {
    protected override readonly eventName: MetaEventName.Simultaneous;
    protected readonly everyGameSystemMustBeLegal: boolean;
    public constructor(gameSystems: ISystemArrayOrFactory<TContext>, ignoreTargetingRequirements = false, everyGameSystemMustBeLegal = false) {
        Contract.assertFalse(ignoreTargetingRequirements && everyGameSystemMustBeLegal, 'ignoreTargetingRequirements and everyGameSystemMustBeLegal cannot be used together');

        if (typeof gameSystems === 'function') {
            super((context: TContext) => ({ gameSystems: gameSystems(context), ignoreTargetingRequirements }));
        } else {
            super({ gameSystems, ignoreTargetingRequirements });
        }
        this.everyGameSystemMustBeLegal = everyGameSystemMustBeLegal;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override eventHandler() {}

    public override getEffectMessage(context: TContext): [string, any[]] {
        const { gameSystems } = this.generatePropertiesFromContext(context);
        const legalSystems = gameSystems.filter((system) => system.hasLegalTarget(context));
        let message = '{0}';
        for (let i = 1; i < legalSystems.length; i++) {
            message += i === legalSystems.length - 1 ? ' and ' : ', ';
            message += '{' + i + '}';
        }
        return [message, legalSystems.map((system) => system.getEffectMessage(context))];
    }

    public override getInnerSystems(properties: ISimultaneousSystemProperties<TContext>) {
        return properties.gameSystems;
    }

    public override hasLegalTarget(context: TContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return properties.gameSystems.some((gameSystem) => gameSystem.hasLegalTarget(context, additionalProperties));
    }

    private allGameSystemsAreLegal(context: TContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return properties.gameSystems.every((gameSystem) => gameSystem.hasLegalTarget(context, additionalProperties));
    }

    public override canAffectInternal(target: GameObject, context: TContext, additionalProperties: any = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return properties.gameSystems.some((gameSystem) => gameSystem.canAffect(target, context, additionalProperties, mustChangeGameState));
    }

    public override allTargetsLegal(context: TContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return properties.gameSystems.some((gameSystem) => gameSystem.hasLegalTarget(context, additionalProperties));
    }

    public override queueGenerateEventGameSteps(events: any[], context: TContext, additionalProperties = {}): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        let queueGenerateEventGameStepsFn: (gameSystem: GameSystem<TContext>) => () => void;
        let generateStepName: (gameSystem: GameSystem<TContext>) => string;

        if (properties.ignoreTargetingRequirements) {
            queueGenerateEventGameStepsFn = (gameSystem: GameSystem<TContext>) => () => {
                gameSystem.queueGenerateEventGameSteps(events, context, additionalProperties);
            };
            generateStepName = (gameSystem: GameSystem<TContext>) => `queue generate event game steps for ${gameSystem.name}`;
        } else {
            if (this.everyGameSystemMustBeLegal && !this.allGameSystemsAreLegal(context, additionalProperties)) {
                return;
            }
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

    public override hasTargetsChosenByPlayer(context) {
        const properties = this.generatePropertiesFromContext(context);
        return properties.gameSystems.some((gameSystem) => gameSystem.hasTargetsChosenByPlayer(context));
    }
}
