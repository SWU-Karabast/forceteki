import { AbilityContext } from '../core/ability/AbilityContext';
import { GameEvent } from '../core/event/GameEvent';
import { GameObject } from '../core/GameObject';
import { GameSystem, IGameSystemProperties } from '../core/gameSystem/GameSystem';

export interface IMultipleGameSystemProperties extends IGameSystemProperties {
    immediateEffects: GameSystem[];
}

export class MultipleGameSystem extends GameSystem<IMultipleGameSystemProperties> {
    public constructor(immediateEffects: GameSystem[]) {
        super({ immediateEffects });
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override eventHandler() {}

    public override getEffectMessage(context: AbilityContext): [string, any[]] {
        const { immediateEffects } = this.generatePropertiesFromContext(context);
        const legalGameActions = immediateEffects.filter((action) => action.hasLegalTarget(context));
        let message = '{0}';
        for (let i = 1; i < legalGameActions.length; i++) {
            message += i === legalGameActions.length - 1 ? ' and ' : ', ';
            message += '{' + i + '}';
        }
        return [message, legalGameActions.map((action) => action.getEffectMessage(context))];
    }

    public override generatePropertiesFromContext(context: AbilityContext, additionalProperties = {}): IMultipleGameSystemProperties {
        const properties = super.generatePropertiesFromContext(context, additionalProperties) as IMultipleGameSystemProperties;
        for (const gameSystem of properties.immediateEffects) {
            gameSystem.setDefaultTargetFn(() => properties.target);
        }
        return properties;
    }

    public override hasLegalTarget(context: AbilityContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return properties.immediateEffects.some((gameAction) => gameAction.hasLegalTarget(context, additionalProperties));
    }

    public override canAffect(target: GameObject, context: AbilityContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return properties.immediateEffects.some((gameAction) => gameAction.canAffect(target, context, additionalProperties));
    }

    public override allTargetsLegal(context: AbilityContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return properties.immediateEffects.some((gameAction) => gameAction.hasLegalTarget(context, additionalProperties));
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: AbilityContext, additionalProperties = {}): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        for (const gameAction of properties.immediateEffects) {
            context.game.queueSimpleStep(() => {
                if (gameAction.hasLegalTarget(context, additionalProperties)) {
                    gameAction.queueGenerateEventGameSteps(events, context, additionalProperties);
                }
            });
        }
    }

    public override hasTargetsChosenByInitiatingPlayer(context) {
        const properties = this.generatePropertiesFromContext(context);
        return properties.immediateEffects.some((gameAction) => gameAction.hasTargetsChosenByInitiatingPlayer(context));
    }

    // TODO: refactor GameSystem so this class doesn't need to override this method (it isn't called since we override hasLegalTarget)
    protected override isTargetTypeValid(target: any): boolean {
        return false;
    }
}
