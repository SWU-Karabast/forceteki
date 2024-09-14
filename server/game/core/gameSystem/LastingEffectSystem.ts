import type { AbilityContext } from '../ability/AbilityContext';
import type PlayerOrCardAbility from '../ability/PlayerOrCardAbility';
import { Duration, EventName, RelativePlayer } from '../Constants';
import type { WhenType } from '../../Interfaces';
import type Player from '../Player';
import { GameSystem, type IGameSystemProperties } from './GameSystem';
import { GameEvent } from '../event/GameEvent';
import OngoingEffect from '../ongoingEffect/OngoingEffect';

export interface ILastingEffectGeneralProperties extends IGameSystemProperties {
    duration: Duration;
    condition?: (context: AbilityContext) => boolean;
    until?: WhenType;
    effect?: any;
    ability?: PlayerOrCardAbility;
}

export interface LastingEffectProperties extends ILastingEffectGeneralProperties {
    targetController?: RelativePlayer | Player;
}

// TODO: how is this related to CardLastingEffectSystem?
/** @deprecated this has not been tried yet */
export class LastingEffectAction extends GameSystem<LastingEffectProperties> {
    public override readonly name = 'applyLastingEffect';
    public override readonly eventName = EventName.OnEffectApplied;
    public override readonly effectDescription = 'apply a lasting effect';

    public eventHandler(event: GameEvent, additionalProperties: any): void {
        const properties = this.generatePropertiesFromContext(event.context, additionalProperties);
        if (!properties.ability) {
            properties.ability = event.context.ability;
        }
        event.context.source[properties.duration](() => properties);
    }

    public override generatePropertiesFromContext(
        context: AbilityContext,
        additionalProperties = {}
    ): LastingEffectProperties & { effect?: OngoingEffect[] } {
        const properties = super.generatePropertiesFromContext(context, additionalProperties) as LastingEffectProperties & {
            effect: any[];
        };
        if (!Array.isArray(properties.effect)) {
            properties.effect = [properties.effect];
        }
        return properties;
    }

    public override hasLegalTarget(context: AbilityContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return properties.effect.length > 0;
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: AbilityContext, additionalProperties: any): void {
        if (this.hasLegalTarget(context, additionalProperties)) {
            events.push(this.generateEvent(null, context, additionalProperties));
        }
    }

    // TODO: refactor GameSystem so this class doesn't need to override this method (it isn't called since we override hasLegalTarget)
    protected override isTargetTypeValid(target: any): boolean {
        return false;
    }
}