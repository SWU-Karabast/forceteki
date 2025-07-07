import type { AbilityContext } from '../core/ability/AbilityContext';
import { PerPlayerPerGameAbilityLimit, type IAbilityLimit } from '../core/ability/AbilityLimit';
import type { TriggeredAbilityContext } from '../core/ability/TriggeredAbilityContext';
import { Duration, EventName, GameStateChangeRequired } from '../core/Constants';
import type { GameEvent } from '../core/event/GameEvent';
import type { IGameSystemProperties } from '../core/gameSystem/GameSystem';
import { GameSystem } from '../core/gameSystem/GameSystem';
import type { IOngoingEffectFactory, WhenType } from '../Interfaces';
import * as Contract from '../core/utils/Contract';
import OngoingEffectLibrary from '../ongoingEffects/OngoingEffectLibrary';
import type { GameObject } from '../core/GameObject';
import type { Card } from '../core/card/Card';

export enum DelayedEffectType {
    Card = 'card',
    Player = 'player'
}

export interface IDelayedEffectProperties extends IGameSystemProperties {
    title: string;
    when: WhenType;
    duration?: Duration;
    limit?: IAbilityLimit;
    immediateEffect: GameSystem<TriggeredAbilityContext>;
    delayedEffectType: DelayedEffectType;
    effectDescription?: string;
}

export class DelayedEffectSystem<TContext extends AbilityContext = AbilityContext> extends GameSystem<TContext, IDelayedEffectProperties> {
    public override readonly name: string = 'applyDelayedEffect';
    public override readonly eventName: EventName = EventName.OnEffectApplied;
    public override readonly effectDescription: string = 'apply a delayed effect';

    protected override defaultProperties: IDelayedEffectProperties = {
        title: null,
        when: null,
        duration: Duration.Persistent,
        limit: null,
        immediateEffect: null,
        delayedEffectType: null
    };

    public eventHandler(event: any, _additionalProperties: Partial<IDelayedEffectProperties>): void {
        const delayedEffectSource = event.sourceCard as Card;

        const effectProperties = event.effectProperties;
        const duration = effectProperties.duration;

        switch (duration) {
            case Duration.Persistent:
                delayedEffectSource.persistent(() => effectProperties);
                break;
            case Duration.UntilEndOfAttack:
                delayedEffectSource.untilEndOfAttack(() => effectProperties);
                break;
            case Duration.UntilEndOfPhase:
                delayedEffectSource.untilEndOfPhase(() => effectProperties);
                break;
            case Duration.UntilEndOfRound:
                delayedEffectSource.untilEndOfRound(() => effectProperties);
                break;
            default:
                Contract.fail(`Invalid Duration ${duration} for DelayedEffect`);
        }
    }

    public override getEffectMessage(context: TContext, additionalProperties?: Partial<IDelayedEffectProperties>): [string, any[]] {
        const { effectDescription, target } = this.generatePropertiesFromContext(context, additionalProperties);

        return [effectDescription ?? this.effectDescription, [this.getTargetMessage(target, context)]];
    }

    public override addPropertiesToEvent(event: any, target: any, context: TContext, additionalProperties?: Partial<IDelayedEffectProperties>): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        this.checkDuration(properties.duration);
        Contract.assertNotNullLike(properties.immediateEffect, 'Immediate Effect cannot be null');
        Contract.assertNotNullLike(context.source, 'Delayed effect source cannot be null');

        if (properties.delayedEffectType === DelayedEffectType.Card) {
            Contract.assertNotNullLike(target, `No target provided for delayed effect from card ${context.source.internalName}`);
            if (Array.isArray(target)) {
                Contract.assertArraySize(target, 1, `Expected exactly one target for delayed effect but found ${target.length}`);
                target = target[0];
            }
        }

        const { title, when, limit, immediateEffect, ...otherProperties } = properties;

        const effectProperties: IOngoingEffectFactory<any> = {
            ...otherProperties,
            matchTarget: properties.delayedEffectType === DelayedEffectType.Card ? target : null,
            ongoingEffect: OngoingEffectLibrary.delayedEffect({
                title,
                when,
                immediateEffect,
                limit: limit ?? new PerPlayerPerGameAbilityLimit(1),
            })
        };

        event.sourceCard = context.source;
        event.effectProperties = effectProperties;
        event.immediateEffect = properties.immediateEffect;
    }

    public override hasLegalTarget(context: TContext, additionalProperties: Partial<IDelayedEffectProperties> = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return properties.immediateEffect != null;
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties: Partial<IDelayedEffectProperties>): void {
        if (this.hasLegalTarget(context, additionalProperties)) {
            events.push(this.generateEvent(context, additionalProperties));
        }
    }

    // TODO: refactor GameSystem so this class doesn't need to override this method (it isn't called since we override hasLegalTarget)
    protected override isTargetTypeValid(target: GameObject): boolean {
        return false;
    }

    protected checkDuration(duration: Duration) {
        Contract.assertFalse(
            duration === Duration.WhileSourceInPlay,
            'Do not use DelayedEffectSystem for "while in play" delayed effects, use WhileSourceInPlayDelayedEffectSystem instead'
        );

        Contract.assertFalse(
            duration === Duration.Custom,
            'Custom duration not implemented yet'
        );
    }

    protected override canAffectInternal(target: GameObject, context: TContext, additionalProperties: Partial<IDelayedEffectProperties> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        return this.isTargetTypeValid(target);
    }
}