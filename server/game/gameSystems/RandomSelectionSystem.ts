import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { GameStateChangeRequired, MetaEventName, RelativePlayer } from '../core/Constants';
import type { GameEvent } from '../core/event/GameEvent';
import { AggregateSystem } from '../core/gameSystem/AggregateSystem';
import type { GameSystem, IGameSystemProperties } from '../core/gameSystem/GameSystem';
import type { Player } from '../core/Player';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import * as Helpers from '../core/utils/Helpers.js';
import * as ChatHelpers from '../core/chat/ChatHelpers';
import type { MsgArg } from '../core/chat/GameChat';


export interface IRandomSelectionSystemProperties<TContext extends AbilityContext = AbilityContext> extends IGameSystemProperties {

    /**
     * The number of targets to randomly select.
     * If not specified, defaults to 1.
     * @type {number}
     */
    count?: number;
    innerSystem: GameSystem<TContext>;
}

/**
 * A system that takes an array of targets and randomly selects {@link IRandomSelectionSystemProperties.count}
 * targets to pass to the inner system.
 */
export class RandomSelectionSystem<TContext extends AbilityContext = AbilityContext> extends AggregateSystem<TContext, IRandomSelectionSystemProperties<TContext>> {
    public override readonly eventName = MetaEventName.RandomSelection;

    public override getInnerSystems(properties: IRandomSelectionSystemProperties<TContext>) {
        return [properties.innerSystem];
    }

    public override generatePropertiesFromContext(context: TContext, additionalProperties: Partial<IRandomSelectionSystemProperties<TContext>>): IRandomSelectionSystemProperties<TContext> {
        const properties = super.generatePropertiesFromContext(context, additionalProperties);
        properties.count = properties.count ?? 1;

        if (!context.targets.randomTarget) {
            const targets = Helpers.asArray(properties.target);
            const selectedTargets = Helpers.getRandomArrayElements(targets, properties.count, context.game.randomGenerator);

            context.targets.randomTarget = selectedTargets.length === 1 ? selectedTargets[0] : selectedTargets;
        }

        properties.innerSystem.setDefaultTargetFn(() => context.targets.randomTarget);

        return properties;
    }

    public override getEffectMessage(context: TContext, additionalProperties: Partial<IRandomSelectionSystemProperties<TContext>> = {}): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const options = properties.target;
        const targets = Helpers.asArray(context.targets.randomTarget);

        const [innerEffectMessage, innerEffectArgs] = properties.innerSystem.getEffectMessage(context, additionalProperties);
        let targetMessage: MsgArg | MsgArg[] = this.getTargetMessage(targets, context);

        if (targets.some((target) => EnumHelpers.isHiddenFromOpponent(target.zoneName, RelativePlayer.Self))) {
            targetMessage = ChatHelpers.pluralize(targets.length, 'a card', 'cards');
            return ['randomly select {0}, and to {1}', [targetMessage, { format: innerEffectMessage, args: innerEffectArgs }]];
        }

        return ['randomly select {0} from {1}, and to {2}', [targetMessage, this.getTargetMessage(options, context), { format: innerEffectMessage, args: innerEffectArgs }]];
    }

    public override canAffectInternal(target: Player | Card, context: TContext, additionalProperties: Partial<IRandomSelectionSystemProperties<TContext>> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        return properties.innerSystem.canAffect(target, context, additionalProperties, mustChangeGameState);
    }

    public override hasLegalTarget(context: TContext, additionalProperties: Partial<IRandomSelectionSystemProperties<TContext>> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        return properties.innerSystem.hasLegalTarget(context, additionalProperties, mustChangeGameState);
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties: Partial<IRandomSelectionSystemProperties<TContext>> = {}): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        context.game.snapshotManager.setRequiresConfirmationToRollbackCurrentSnapshot();
        properties.innerSystem.queueGenerateEventGameSteps(events, context, additionalProperties);
    }
}