import type { AbilityContext } from '../core/ability/AbilityContext';
import type { RelativePlayer } from '../core/Constants';
import { Duration, EventName, GameStateChangeRequired } from '../core/Constants';
import type { GameEvent } from '../core/event/GameEvent';
import type { GameObject } from '../core/GameObject';
import { GameSystem } from '../core/gameSystem/GameSystem';
import type { ILastingEffectPropertiesBase } from '../core/gameSystem/LastingEffectPropertiesBase';
import type { Player } from '../core/Player';
import * as Contract from '../core/utils/Contract';

export type IPlayerLastingEffectProperties = ILastingEffectPropertiesBase & {

    /** Default is `RelativePlayer.Self` */
    targetPlayer?: RelativePlayer | Player;
};

export class PlayerLastingEffectSystem<TContext extends AbilityContext = AbilityContext> extends GameSystem<TContext, IPlayerLastingEffectProperties> {
    public override readonly name: string = 'applyPlayerLastingEffect';
    public override readonly eventName: EventName = EventName.OnEffectApplied;

    public eventHandler(event: any, additionalProperties: Partial<IPlayerLastingEffectProperties>): void {
        const properties = this.generatePropertiesFromContext(event.context, additionalProperties);
        if (!properties.ability) {
            properties.ability = event.context.ability;
        }

        const { effect, ...otherProperties } = properties;

        const renamedProperties = Object.assign(otherProperties, { ongoingEffect: effect });

        const effectType = properties.duration === Duration.Custom ? 'lastingEffect' : properties.duration;
        event.context.source[effectType](() => renamedProperties);
    }

    public override generatePropertiesFromContext(context: TContext, additionalProperties: Partial<IPlayerLastingEffectProperties> = {}) {
        const properties = super.generatePropertiesFromContext(context, additionalProperties);
        if (!Array.isArray(properties.effect)) {
            properties.effect = [properties.effect];
        }
        return properties;
    }

    public override hasLegalTarget(context: TContext, additionalProperties: Partial<IPlayerLastingEffectProperties> = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return properties.effect.length > 0;
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties: Partial<IPlayerLastingEffectProperties>): void {
        if (this.hasLegalTarget(context, additionalProperties)) {
            events.push(this.generateEvent(context, additionalProperties));
        }
    }

    // TODO: refactor GameSystem so this class doesn't need to override this method (it isn't called since we override hasLegalTarget)
    protected override isTargetTypeValid(target: GameObject): boolean {
        return false;
    }

    protected override canAffectInternal(target: GameObject, context: TContext, additionalProperties: Partial<IPlayerLastingEffectProperties> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        return this.isTargetTypeValid(target);
    }

    public override getEffectMessage(context: TContext, additionalProperties?: Partial<IPlayerLastingEffectProperties>): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        const description = properties.ongoingEffectDescription ?? 'apply a lasting effect to';
        let durationStr: string;
        switch (properties.duration) {
            case Duration.UntilEndOfAttack:
                durationStr = ' for this attack';
                break;
            case Duration.UntilEndOfPhase:
                durationStr = ' for this phase';
                break;
            case Duration.UntilEndOfRound:
                durationStr = ' for the rest of the round';
                break;
            case Duration.WhileSourceInPlay:
                durationStr = ' while in play';
                break;
            case Duration.Persistent:
            case Duration.Custom:
                durationStr = '';
                break;
            default:
                Contract.fail(`Unknown duration: ${(properties as any).duration}`);
        }

        return [`${description} {0}${durationStr}`, [properties.ongoingEffectTargetDescription ?? properties.target]];
    }
}
