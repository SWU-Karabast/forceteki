import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { GameStateChangeRequired, MetaEventName } from '../core/Constants';
import type { GameEvent } from '../core/event/GameEvent';
import { AggregateSystem } from '../core/gameSystem/AggregateSystem';
import type { GameSystem, IGameSystemProperties, PlayerOrCard } from '../core/gameSystem/GameSystem';
import type { Player } from '../core/Player';
import * as Contract from '../core/utils/Contract';
import * as Helpers from '../core/utils/Helpers';
import * as ChatHelpers from '../core/chat/ChatHelpers';
import type { FormatMessage } from '../core/chat/GameChat';

export interface IRandomSelectionSystemProperties<TContext extends AbilityContext = AbilityContext> extends IGameSystemProperties {
    title: string;
    count: number;
    innerSystem: GameSystem<TContext>;
}

export class RandomSelectionSystem<TContext extends AbilityContext = AbilityContext> extends AggregateSystem<TContext, IRandomSelectionSystemProperties<TContext>> {
    protected override readonly eventName = MetaEventName.RandomSelection;

    public override getInnerSystems(properties: IRandomSelectionSystemProperties<TContext>) {
        return [properties.innerSystem];
    }

    public override getEffectMessage(context: TContext, additionalProperties: Partial<IRandomSelectionSystemProperties<TContext>> = {}): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const target: PlayerOrCard | PlayerOrCard[] | string | FormatMessage = properties.target;
        return [`randomly ${ChatHelpers.verb(properties, 'select', 'selecting')} {0} of {1}`, [properties.count, target]];
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
        const targets = Helpers.asArray(properties.target);

        if (targets.length < properties.count) {
            Contract.fail(`Cannot select ${properties.count} targets from a list of ${targets.length}`);
        }

        const selectedTargets = Helpers.getRandomArrayElements(targets, properties.count, context.game.randomGenerator);

        if (selectedTargets.length === 1) {
            context.target = selectedTargets[0];
        } else {
            context.target = selectedTargets;
        }

        const finalAdditionalProperties = { ...additionalProperties, target: selectedTargets };

        this.addSelectionMessage(context, properties, finalAdditionalProperties);
        properties.innerSystem.queueGenerateEventGameSteps(events, context, finalAdditionalProperties);
    }

    private addSelectionMessage(
        context: TContext,
        properties: IRandomSelectionSystemProperties<TContext>,
        additionalProperties: Partial<IRandomSelectionSystemProperties<TContext>> = {}
    ): void {
        const messageArgs = [context.player, ' uses ', context.source, ' to '];
        const [effectMessage, effectArgs] = properties.innerSystem.getEffectMessage(context, additionalProperties);
        context.game.addMessage('{0}{1}{2}{3}{4}{5}{6}{7}{8}', ...messageArgs, { message: context.game.gameChat.formatMessage(effectMessage, effectArgs) });
    }
}