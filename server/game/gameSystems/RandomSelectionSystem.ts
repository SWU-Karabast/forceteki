import type { IGameSystemInput } from '../core/gameSystem/GameSystem';
import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { GameStateChangeRequired, MetaEventName, RelativePlayer } from '../core/Constants';
import type { GameEvent } from '../core/event/GameEvent';
import { AggregateSystem } from '../core/gameSystem/AggregateSystem';
import type { GameSystem, IGameSystemProperties } from '../core/gameSystem/GameSystem';
import type { Player } from '../core/Player';
import { EnumHelpers } from '../core/utils/EnumHelpers';
import { Helpers } from '../core/utils/Helpers.js';
import { ChatHelpers } from '../core/chat/ChatHelpers';
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

    protected override prepareProperties(context: TContext, properties: IRandomSelectionSystemProperties<TContext>): void {
        super.prepareProperties(context, properties);

        properties.count = properties.count ?? 1;

        if (!context.targets.randomTarget) {
            const targets = Helpers.asArray(properties.target);
            const selectedTargets = Helpers.getRandomArrayElements(targets, properties.count, context.game.randomGenerator);

            context.targets.randomTarget = selectedTargets.length === 1 ? selectedTargets[0] : selectedTargets;
        }

        properties.innerSystem.setDefaultTargetFn(() => context.targets.randomTarget);
    }

    protected override getEffectMessageInternal(context: TContext, properties: IRandomSelectionSystemProperties<TContext>, additionalProperties: Partial<IGameSystemInput<IRandomSelectionSystemProperties<TContext>>> = {}): [string, any[]] {
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

    protected override canAffectInternal(target: Player | Card, context: TContext, properties: IRandomSelectionSystemProperties<TContext>, mustChangeGameState = GameStateChangeRequired.None, additionalProperties: Partial<IGameSystemInput<IRandomSelectionSystemProperties<TContext>>> = {}): boolean {
        return properties.innerSystem.canAffect(target, context, additionalProperties, mustChangeGameState);
    }

    protected override hasLegalTargetInternal(context: TContext, properties: IRandomSelectionSystemProperties<TContext>, mustChangeGameState = GameStateChangeRequired.None, additionalProperties: Partial<IGameSystemInput<IRandomSelectionSystemProperties<TContext>>> = {}): boolean {
        return properties.innerSystem.hasLegalTarget(context, additionalProperties, mustChangeGameState);
    }

    protected override queueGenerateEventGameStepsInternal(events: GameEvent[], context: TContext, properties: IRandomSelectionSystemProperties<TContext>, additionalProperties: Partial<IGameSystemInput<IRandomSelectionSystemProperties<TContext>>> = {}): void {
        for (const player of context.game.getPlayers()) {
            context.game.snapshotManager.setRequiresConfirmationToRollbackCurrentSnapshot(player.id);
        }
        properties.innerSystem.queueGenerateEventGameSteps(events, context, additionalProperties);
    }
}