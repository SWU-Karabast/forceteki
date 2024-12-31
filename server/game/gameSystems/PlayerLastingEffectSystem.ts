import type { AbilityContext } from '../core/ability/AbilityContext';
import type { RelativePlayer } from '../core/Constants';
import { EventName } from '../core/Constants';
import type { GameEvent } from '../core/event/GameEvent';
import { GameSystem } from '../core/gameSystem/GameSystem';
import type { ILastingEffectPropertiesBase } from '../core/gameSystem/LastingEffectPropertiesBase';
import { OngoingEffect } from '../core/ongoingEffect/OngoingEffect';
import type Player from '../core/Player';

export interface IPlayerLastingEffectProperties extends ILastingEffectPropertiesBase {

    /** Default is `RelativePlayer.Self` */
    targetPlayer?: RelativePlayer | Player;
}

export class PlayerLastingEffectSystem<TContext extends AbilityContext = AbilityContext> extends GameSystem<TContext, IPlayerLastingEffectProperties> {
    public override readonly name: string = 'applyPlayerLastingEffect';
    public override readonly eventName: EventName = EventName.OnEffectApplied;
    public override readonly effectDescription: string = 'apply a lasting effect targeting a player';

    public eventHandler(event: any, additionalProperties: any): void {
        const properties = this.generatePropertiesFromContext(event.context, additionalProperties);
        if (!properties.ability) {
            properties.ability = event.context.ability;
        }

        const { effect, ...otherProperties } = properties;

        const renamedProperties = Object.assign(otherProperties, { ongoingEffect: effect });

        event.context.source[properties.duration](() => renamedProperties);
    }

    public override generatePropertiesFromContext(context: TContext, additionalProperties = {}) {
        const properties = super.generatePropertiesFromContext(context, additionalProperties);
        if (!Array.isArray(properties.effect)) {
            properties.effect = [properties.effect];
        }
        return properties;
    }

    public override hasLegalTarget(context: TContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return properties.effect.length > 0;
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
