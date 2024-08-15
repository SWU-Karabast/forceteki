import { AbilityContext } from '../ability/AbilityContext';
import PlayerOrCardAbility from '../ability/PlayerOrCardAbility';
import Card from '../card/Card';
import { Duration, EffectName, EventName, Location, WildcardLocation } from '../Constants';
import { CardTargetSystem, ICardTargetSystemProperties } from './CardTargetSystem';
import type { ILastingEffectGeneralProperties } from './LastingEffectSystem';

export interface ILastingEffectCardProperties extends Omit<ILastingEffectGeneralProperties, 'target'>, ICardTargetSystemProperties {
    targetLocation?: Location | Location[];
}

// TODO: how is this related to LastingEffectSystem?
/**
 * For a definition, see SWU 7.3 'Lasting Effects': "A lasting effect is a part of an ability that affects the game for a specified duration of time.
 * Most lasting effects include the phrase 'for this phase' or 'for this attack.'"
 */
export class LastingEffectCardSystem extends CardTargetSystem<ILastingEffectCardProperties> {
    override name = 'applyLastingEffect';
    override eventName = EventName.OnEffectApplied;
    override effectDescription = 'apply a lasting effect to {0}';
    override defaultProperties: ILastingEffectCardProperties = {
        duration: Duration.UntilEndOfAttack,
        effect: [],
        ability: null
    };

    override generatePropertiesFromContext(context: AbilityContext, additionalProperties = {}): ILastingEffectCardProperties {
        const properties = super.generatePropertiesFromContext(context, additionalProperties) as ILastingEffectCardProperties;
        if (!Array.isArray(properties.effect)) {
            properties.effect = [properties.effect];
        }
        return properties;
    }

    override canAffect(card: Card, context: AbilityContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        properties.effect = properties.effect.map((factory) => factory(context.game, context.source, properties));
        const lastingEffectRestrictions = card.getEffectValues(EffectName.CannotApplyLastingEffects);
        return (
            super.canAffect(card, context) &&
            properties.effect.some(
                (props) =>
                    props.impl.canBeApplied(card) &&
                    !lastingEffectRestrictions.some((condition) => condition(props.effect))
            )
        );
    }

    eventHandler(event, additionalProperties): void {
        const properties = this.generatePropertiesFromContext(event.context, additionalProperties);
        if (!properties.ability) {
            properties.ability = event.context.ability;
        }

        const lastingEffectRestrictions = event.card.getEffectValues(EffectName.CannotApplyLastingEffects);
        const { effect, ...otherProperties } = properties;
        const effectProperties = Object.assign({ match: event.card, location: WildcardLocation.Any }, otherProperties);
        let effects = properties.effect.map((factory) =>
            factory(event.context.game, event.context.source, effectProperties)
        );
        effects = effects.filter(
            (props) =>
                props.impl.canBeApplied(event.card) &&
                !lastingEffectRestrictions.some((condition) => condition(props.impl))
        );
        for (const effect of effects) {
            event.context.game.effectEngine.add(effect);
        }
    }
}
