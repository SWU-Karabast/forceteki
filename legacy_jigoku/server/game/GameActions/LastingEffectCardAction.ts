import type { AbilityContext } from '../AbilityContext';
import type BaseCard from '../basecard';
import { Durations, EffectNames, EventNames, Locations } from '../Constants';
import { CardGameAction } from './CardGameAction';
import type { LastingEffectGeneralProperties } from './LastingEffectAction';

export interface LastingEffectCardProperties extends LastingEffectGeneralProperties {
    targetLocation?: Locations | Locations[];
    canChangeZoneOnce?: boolean;
    canChangeZoneNTimes?: number;
}

export class LastingEffectCardAction<
    P extends LastingEffectCardProperties = LastingEffectCardProperties
    // @ts-ignore
> extends CardGameAction<P> {
    name = 'applyLastingEffect';
    eventName = EventNames.OnEffectApplied;
    effect = 'apply a lasting effect to {0}';
    // @ts-ignore
    defaultProperties: LastingEffectCardProperties = {
        duration: Durations.UntilEndOfConflict,
        canChangeZoneOnce: false,
        canChangeZoneNTimes: 0,
        effect: [],
        ability: null
    };

    // @ts-ignore
    getProperties(context: AbilityContext, additionalProperties = {}): LastingEffectCardProperties {
        let properties = super.getProperties(context, additionalProperties) as LastingEffectCardProperties;
        if (!Array.isArray(properties.effect)) {
            properties.effect = [properties.effect];
        }
        return properties;
    }

    canAffect(card: BaseCard, context: AbilityContext, additionalProperties = {}): boolean {
        let properties = this.getProperties(context, additionalProperties);
        properties.effect = properties.effect.map((factory) => factory(context.game, context.source, properties));
        const lastingEffectRestrictions = card.getEffects(EffectNames.CannotApplyLastingEffects);
        return (
            super.canAffect(card, context) &&
            properties.effect.some(
                (props) =>
                    props.effect.canBeApplied(card) &&
                    !lastingEffectRestrictions.some((condition) => condition(props.effect))
            )
        );
    }

    eventHandler(event, additionalProperties): void {
        let properties = this.getProperties(event.context, additionalProperties);
        if (!properties.ability) {
            properties.ability = event.context.ability;
        }

        const lastingEffectRestrictions = event.card.getEffects(EffectNames.CannotApplyLastingEffects);
        const { effect, ...otherProperties } = properties;
        const effectProperties = Object.assign({ match: event.card, location: Locations.Any }, otherProperties);
        let effects = properties.effect.map((factory) =>
            factory(event.context.game, event.context.source, effectProperties)
        );
        effects = effects.filter(
            (props) =>
                props.effect.canBeApplied(event.card) &&
                !lastingEffectRestrictions.some((condition) => condition(props.effect))
        );
        for (const effect of effects) {
            event.context.game.effectEngine.add(effect);
        }
    }
}
