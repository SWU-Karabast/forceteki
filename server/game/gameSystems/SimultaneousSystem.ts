import { AbilityContext } from '../core/ability/AbilityContext';
import { GameObject } from '../core/GameObject';
import { GameSystem, IGameSystemProperties } from '../core/gameSystem/GameSystem';

export interface ISimultaneousSystemProperties extends IGameSystemProperties {
    gameSystems: GameSystem[];

    /**
     * If this is set to true, we will assume every system has a legal target and trigger it.
     * Needed for situations where there currently isn't a target but an earlier system in the chain will create one.
     */
    ignoreTargetingRequirements?: boolean;
}

export class SimultaneousGameSystem extends GameSystem<ISimultaneousSystemProperties> {
    protected override readonly defaultProperties: ISimultaneousSystemProperties = {
        gameSystems: null,
        ignoreTargetingRequirements: false
    };

    public constructor(gameSystems: GameSystem[], ignoreTargetingRequirements = null) {
        super({ gameSystems, ignoreTargetingRequirements });
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override eventHandler() {}

    public override getEffectMessage(context: AbilityContext): [string, any[]] {
        const { gameSystems } = this.generatePropertiesFromContext(context);
        const legalSystems = gameSystems.filter((system) => system.hasLegalTarget(context));
        let message = '{0}';
        for (let i = 1; i < legalSystems.length; i++) {
            message += i === legalSystems.length - 1 ? ' and ' : ', ';
            message += '{' + i + '}';
        }
        return [message, legalSystems.map((system) => system.getEffectMessage(context))];
    }

    public override generatePropertiesFromContext(context: AbilityContext, additionalProperties = {}): ISimultaneousSystemProperties {
        const properties = super.generatePropertiesFromContext(context, additionalProperties);
        for (const gameSystem of properties.gameSystems) {
            gameSystem.setDefaultTargetFn(() => properties.target);
        }
        return properties;
    }

    public override hasLegalTarget(context: AbilityContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return properties.gameSystems.some((gameSystem) => gameSystem.hasLegalTarget(context, additionalProperties));
    }

    public override canAffect(target: GameObject, context: AbilityContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return properties.gameSystems.some((gameSystem) => gameSystem.canAffect(target, context, additionalProperties));
    }

    public override allTargetsLegal(context: AbilityContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return properties.gameSystems.some((gameSystem) => gameSystem.hasLegalTarget(context, additionalProperties));
    }

    public override queueGenerateEventGameSteps(events: any[], context: AbilityContext, additionalProperties = {}): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        let queueGenerateEventGameStepsFn: (gameSystem: GameSystem) => void;
        let generateStepName: (gameSystem: GameSystem) => string;

        if (properties.ignoreTargetingRequirements) {
            queueGenerateEventGameStepsFn = (gameSystem: GameSystem) => () => {
                gameSystem.queueGenerateEventGameSteps(events, context, additionalProperties);
            };
            generateStepName = (gameSystem: GameSystem) => `queue generate event game steps for ${gameSystem.name}`;
        } else {
            queueGenerateEventGameStepsFn = (gameSystem: GameSystem) => () => {
                if (gameSystem.hasLegalTarget(context, additionalProperties)) {
                    gameSystem.queueGenerateEventGameSteps(events, context, additionalProperties);
                }
            };
            generateStepName = (gameSystem: GameSystem) => `check targets and queue generate event game steps for ${gameSystem.name}`;
        }

        for (const gameSystem of properties.gameSystems) {
            context.game.queueSimpleStep(queueGenerateEventGameStepsFn(gameSystem), generateStepName(gameSystem));
        }
    }

    public override hasTargetsChosenByInitiatingPlayer(context) {
        const properties = this.generatePropertiesFromContext(context);
        return properties.gameSystems.some((gameSystem) => gameSystem.hasTargetsChosenByInitiatingPlayer(context));
    }

    // TODO: refactor GameSystem so this class doesn't need to override this method (it isn't called since we override hasLegalTarget)
    protected override isTargetTypeValid(target: any): boolean {
        return false;
    }
}
