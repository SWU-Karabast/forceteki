import AbilityHelper from '../AbilityHelper';
import { AbilityContext } from '../core/ability/AbilityContext';
import { IAbilityLimit } from '../core/ability/AbilityLimit';
import { TriggeredAbilityContext } from '../core/ability/TriggeredAbilityContext';
import { Duration, EffectName, EventName, GameStateChangeRequired, PhaseName, WildcardZoneName } from '../core/Constants';
import { GameEvent } from '../core/event/GameEvent';
import { GameSystem, IGameSystemProperties } from '../core/gameSystem/GameSystem';
import { OngoingEffectBuilder } from '../core/ongoingEffect/OngoingEffectBuilder';
import { WhenType } from '../Interfaces';
import * as Contract from '../core/utils/Contract';
import { OngoingEffectSource } from '../core/ongoingEffect/OngoingEffectSource';
import { last } from 'underscore';

export interface IDelayedEffectSystemProperties extends IGameSystemProperties {
    when: WhenType;
    duration?: Duration;
    limit?: IAbilityLimit;
    immediateEffect: GameSystem<TriggeredAbilityContext>;
}

export class DelayedEffectSystem<TContext extends AbilityContext = AbilityContext> extends GameSystem<TContext, IDelayedEffectSystemProperties> {
    public override readonly name: string = 'applyDelayedEffect';
    public override readonly eventName: EventName = EventName.OnEffectApplied;
    public override readonly effectDescription: string = 'apply a delayed effect';

    protected override defaultProperties: IDelayedEffectSystemProperties = {
        when: null,
        duration: null,
        limit: AbilityHelper.limit.perGame(1),
        immediateEffect: null
    };

    public eventHandler(event: any, additionalProperties: any): void {
        const properties = this.generatePropertiesFromContext(event.context, additionalProperties);
        // TODO Remove this if we don't need it
        // if (!properties.ability) {
        //     properties.ability = event.context.ability;
        // }

        const { when, duration, limit, immediateEffect, ...otherProperties } = properties;

        const delayedEffect = AbilityHelper.ongoingEffects.delayedEffect({
            title: 'Discard a card from your hand',
            when: when,
            immediateEffect: immediateEffect,
            limit: limit
        });

        const renamedProperties = Object.assign(otherProperties, { ongoingEffect: delayedEffect });

        // If target is set, this targeting a card; otherwise, it is targeting a player
        const delayedEffectTarget = event.context.target || event.context.source;

        // Add more Durations as we implement
        switch (duration) {
            case Duration.UntilEndOfRound:
                // TODO - Is this how we want to implement these? If no duration is provided, what do we set here?
                delayedEffectTarget.untilEndOfRound(() => renamedProperties);
                break;
            default:
                Contract.fail('Invalid Duration for DelayedEffect');
        }
    }

    public override generatePropertiesFromContext(context: TContext, additionalProperties = {}) {
        const properties = super.generatePropertiesFromContext(context, additionalProperties);
        return properties;
    }

    public override hasLegalTarget(context: TContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return properties.immediateEffect != null;
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties: any): void {
        if (this.hasLegalTarget(context, additionalProperties)) {
            events.push(this.generateEvent(context, additionalProperties));
        }
    }

    // TODO: refactor GameSystem so this class doesn't need to override this method (it isn't called since we override hasLegalTarget)
    protected override isTargetTypeValid(target: any): boolean {
        return false;
    }
}