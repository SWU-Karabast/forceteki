import { RingAction } from './RingAction';
import { Durations, EventNames } from '../Constants';
import { LastingEffectGeneralProperties } from './LastingEffectAction';

export interface LastingEffectRingProperties extends LastingEffectGeneralProperties {
}

export class LastingEffectRingAction extends RingAction {
    name = 'applyLastingEffect';
    eventName = EventNames.OnEffectApplied;
    effect = 'apply a lasting effect';
    defaultProperties: LastingEffectRingProperties = {
        duration: Durations.UntilEndOfConflict,
        effect: [],
        ability: null
    };

    eventHandler(event, additionalProperties): void {
        let properties = this.getProperties(event.context, additionalProperties) as LastingEffectRingProperties;
        if (!properties.ability) {
            properties.ability = event.context.ability;
        }
        event.context.source[properties.duration](() => Object.assign({ match: event.ring }, properties));
    }
}
