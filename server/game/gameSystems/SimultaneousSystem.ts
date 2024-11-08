import { AbilityContext } from '../core/ability/AbilityContext';
import { GameStateChangeRequired, MetaEventName } from '../core/Constants';
import { GameObject } from '../core/GameObject';
import { GameSystem, IGameSystemProperties } from '../core/gameSystem/GameSystem';
import { AggregateSystem } from '../core/gameSystem/AggregateSystem';

export interface ISimultaneousSystemProperties<TContext extends AbilityContext = AbilityContext> extends IGameSystemProperties {
    gameSystems: GameSystem<TContext>[];

    /**
     * If this is set to true, we will assume every system has a legal target and trigger it.
     * Needed for situations where there currently isn't a target but an earlier system in the chain will create one.
     */
    ignoreTargetingRequirements?: boolean;
}

export class SimultaneousGameSystem<TContext extends AbilityContext = AbilityContext> extends AggregateSystem<TContext, ISimultaneousSystemProperties<TContext>> {
    protected override readonly eventName: MetaEventName.Simultaneous;
    protected override readonly defaultProperties: ISimultaneousSystemProperties<TContext> = {
        gameSystems: null,
        ignoreTargetingRequirements: false
    };

    public constructor(gameSystems: (GameSystem<TContext>)[], ignoreTargetingRequirements = null) {
        super({ gameSystems, ignoreTargetingRequirements });
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

    public override canAffect(target: GameObject, context: TContext, additionalProperties: any = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return properties.gameSystems.some((gameSystem) => gameSystem.canAffect(target, context, additionalProperties, mustChangeGameState));
    }

    public override allTargetsLegal(context: TContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return properties.gameSystems.some((gameSystem) => gameSystem.hasLegalTarget(context, additionalProperties));
    }

    public override queueGenerateEventGameSteps(events: any[], context: TContext, additionalProperties = {}): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        let queueGenerateEventGameStepsFn: (gameSystem: GameSystem<TContext>) => void;
        let generateStepName: (gameSystem: GameSystem<TContext>) => string;

        if (properties.ignoreTargetingRequirements) {
            queueGenerateEventGameStepsFn = (gameSystem: GameSystem<TContext>) => () => {
                gameSystem.queueGenerateEventGameSteps(events, context, additionalProperties);
            };
            generateStepName = (gameSystem: GameSystem<TContext>) => `queue generate event game steps for ${gameSystem.name}`;
        } else {
            queueGenerateEventGameStepsFn = (gameSystem: GameSystem<TContext>) => () => {
                if (gameSystem.hasLegalTarget(context, additionalProperties)) {
                    gameSystem.queueGenerateEventGameSteps(events, context, additionalProperties);
                }
            };
            generateStepName = (gameSystem: GameSystem<TContext>) => `check targets and queue generate event game steps for ${gameSystem.name}`;
        }

        for (const gameSystem of properties.gameSystems) {
            context.game.queueSimpleStep(queueGenerateEventGameStepsFn(gameSystem), generateStepName(gameSystem));
        }
    }

    public override hasTargetsChosenByInitiatingPlayer(context) {
        const properties = this.generatePropertiesFromContext(context);
        return properties.gameSystems.some((gameSystem) => gameSystem.hasTargetsChosenByInitiatingPlayer(context));
    }
}
