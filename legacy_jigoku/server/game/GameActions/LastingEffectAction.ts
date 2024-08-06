import type { AbilityContext } from '../AbilityContext';
import type BaseAbility from '../baseability';
import { Durations, EventNames, Players } from '../Constants';
import type { WhenType } from '../Interfaces';
import type Player from '../player';
import { GameAction, type GameActionProperties } from './GameAction';

export interface LastingEffectGeneralProperties extends GameActionProperties {
    duration?: Durations;
    condition?: (context: AbilityContext) => boolean;
    until?: WhenType;
    effect?: any;
    ability?: BaseAbility;
}

export interface LastingEffectProperties extends LastingEffectGeneralProperties {
    targetController?: Players | Player;
}

export class LastingEffectAction<P extends LastingEffectProperties = LastingEffectProperties> extends GameAction<P> {
    name = 'applyLastingEffect';
    eventName = EventNames.OnEffectApplied;
    effect = 'apply a lasting effect';
    // @ts-ignore
    defaultProperties: LastingEffectProperties = {
        duration: Durations.UntilEndOfConflict,
        effect: [],
        ability: null
    } as LastingEffectProperties;

    // @ts-ignore
    getProperties(
        context: AbilityContext,
        additionalProperties = {}
    ): LastingEffectProperties & { effect?: Array<any> } {
        let properties = super.getProperties(context, additionalProperties) as LastingEffectProperties & {
            effect: Array<any>;
        };
        if (!Array.isArray(properties.effect)) {
            properties.effect = [properties.effect];
        }
        return properties;
    }

    hasLegalTarget(context: AbilityContext, additionalProperties = {}): boolean {
        let properties = this.getProperties(context, additionalProperties);
        return properties.effect.length > 0;
    }

    addEventsToArray(events: any[], context: AbilityContext, additionalProperties: any): void {
        if (this.hasLegalTarget(context, additionalProperties)) {
            events.push(this.getEvent(null, context, additionalProperties));
        }
    }

    eventHandler(event: any, additionalProperties: any): void {
        let properties = this.getProperties(event.context, additionalProperties);
        if (!properties.ability) {
            properties.ability = event.context.ability;
        }
        event.context.source[properties.duration](() => properties);
    }
}