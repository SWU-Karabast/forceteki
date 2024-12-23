import { AbilityContext } from '../core/ability/AbilityContext';
import { IAbilityLimit, perGame } from '../core/ability/AbilityLimit';
import { TriggeredAbilityContext } from '../core/ability/TriggeredAbilityContext';
import { Duration, EventName } from '../core/Constants';
import { GameEvent } from '../core/event/GameEvent';
import { GameSystem, IGameSystemProperties } from '../core/gameSystem/GameSystem';
import { WhenType } from '../Interfaces';
import * as Contract from '../core/utils/Contract';
import OngoingEffectLibrary from '../ongoingEffects/OngoingEffectLibrary';

export enum DelayedEffectType {
    Card = 'card',
    Player = 'player'
}

export interface IDelayedEffectSystemProperties extends IGameSystemProperties {
    title: string;
    when: WhenType;
    duration?: Duration;
    limit?: IAbilityLimit;
    immediateEffect: GameSystem<TriggeredAbilityContext>;
    effectType: DelayedEffectType;
}

export class DelayedEffectSystem<TContext extends AbilityContext = AbilityContext> extends GameSystem<TContext, IDelayedEffectSystemProperties> {
    public override readonly name: string = 'applyDelayedEffect';
    public override readonly eventName: EventName = EventName.OnEffectApplied;
    public override readonly effectDescription: string = 'apply a delayed effect';

    protected override defaultProperties: IDelayedEffectSystemProperties = {
        title: null,
        when: null,
        duration: Duration.Persistent,
        limit: perGame(1),
        immediateEffect: null,
        effectType: null
    };

    public eventHandler(event: any, additionalProperties: any): void {
        // TODO Remove this if we don't need it
        // if (!properties.ability) {
        //     properties.ability = event.context.ability;
        // }

        const delayedEffectSource = event.sourceCard;

        const renamedProperties = event.renamedProperties;
        const duration = renamedProperties.duration;

        switch (duration) {
            case Duration.Persistent:
                delayedEffectSource.persistent(() => renamedProperties);
                break;
            case Duration.UntilEndOfAttack:
                delayedEffectSource.untilEndOfAttack(() => renamedProperties);
                break;
            case Duration.UntilEndOfPhase:
                delayedEffectSource.untilEndOfPhase(() => renamedProperties);
                break;
            case Duration.UntilEndOfRound:
                delayedEffectSource.untilEndOfRound(() => renamedProperties);
                break;
            case Duration.Custom:
                throw new Error(`Duration ${duration} not implemented yet`);
            default:
                Contract.fail(`Invalid Duration ${duration} for DelayedEffect`);
        }
    }

    public override addPropertiesToEvent(event: any, target: any, context: TContext, additionalProperties?: any): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        event.sourceCard = this.getDelayedEffectSource(event, context, additionalProperties);
        Contract.assertNotNullLike(properties.immediateEffect, 'Immediate Effect cannot be null');

        const { title, when, limit, immediateEffect, ...otherProperties } = properties;

        const renamedProperties = { ...otherProperties, ongoingEffect:
            OngoingEffectLibrary.delayedEffect({
                title,
                when,
                immediateEffect,
                limit
            }) };

        event.renamedProperties = renamedProperties;
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

    private getDelayedEffectSource (event: any, context: TContext, additionalProperties?: any) {
        const { effectType, target } = this.generatePropertiesFromContext(context, additionalProperties);

        switch (effectType) {
            case DelayedEffectType.Card:
                Contract.assertNotNullLike(target, `No target provided for delayed effect from card ${context.source.internalName}`);

                let nonArrayTarget;
                if (Array.isArray(target)) {
                    Contract.assertArraySize(target, 1, `Expected exactly one target for delayed effect but found ${target.length}`);
                    nonArrayTarget = target[0];
                } else {
                    nonArrayTarget = target;
                }

                return nonArrayTarget;
            case DelayedEffectType.Player:
                return event.context.source;
            default:
                Contract.fail(`Unknown delayed effect type: ${effectType}`);
        }
    }
}