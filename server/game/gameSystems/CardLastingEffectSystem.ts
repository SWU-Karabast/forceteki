import { AbilityContext } from '../core/ability/AbilityContext';
import { Card } from '../core/card/Card';
import { Duration, EffectName, EventName, ZoneName, WildcardZoneName } from '../core/Constants';
import { CardTargetSystem, ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import type { ILastingEffectPropertiesBase } from '../core/gameSystem/LastingEffectPropertiesBase';

export interface ICardLastingEffectProperties extends Omit<ILastingEffectPropertiesBase, 'target'>, ICardTargetSystemProperties {
    targetZoneFilter?: ZoneName | ZoneName[];
}

/**
 * For a definition, see SWU 7.7.3 'Lasting Effects': "A lasting effect is a part of an ability that affects the game for a specified duration of time.
 * Most lasting effects include the phrase 'for this phase' or 'for this attack.'"
 */
export class CardLastingEffectSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, ICardLastingEffectProperties> {
    public override readonly name: string = 'applyCardLastingEffect';
    public override readonly eventName = EventName.OnEffectApplied;
    public override readonly effectDescription: string = 'apply a lasting effect to {0}';
    protected override readonly defaultProperties: ICardLastingEffectProperties = {
        duration: null,
        effect: [],
        ability: null
    };

    public eventHandler(event, additionalProperties): void {
        let effects = event.effectFactories.map((factory) =>
            factory(event.context.game, event.context.source, event.effectProperties)
        );

        const lastingEffectRestrictions = event.card.getOngoingEffectValues(EffectName.CannotApplyLastingEffects);
        effects = effects.filter(
            (props) =>
                props.impl.canBeApplied(event.card) &&
                !lastingEffectRestrictions.some((condition) => condition(props.impl))
        );

        for (const effect of effects) {
            event.context.game.ongoingEffectEngine.add(effect);
        }
    }

    public override generatePropertiesFromContext(context: TContext, additionalProperties = {}): ICardLastingEffectProperties {
        const properties = super.generatePropertiesFromContext(context, additionalProperties);
        if (!Array.isArray(properties.effect)) {
            properties.effect = [properties.effect];
        }

        return properties;
    }

    public override addPropertiesToEvent(event: any, card: Card, context: TContext, additionalProperties?: any): void {
        super.addPropertiesToEvent(event, card, context, additionalProperties);

        const { effectFactories, effectProperties } = this.getEffectFactoriesAndProperties(card, context, additionalProperties);

        event.effectFactories = effectFactories;
        event.effectProperties = effectProperties;
    }

    public override canAffect(card: Card, context: TContext, additionalProperties = {}): boolean {
        const { effectFactories, effectProperties } = this.getEffectFactoriesAndProperties(card, context, additionalProperties);

        const effects = effectFactories.map((factory) => factory(context.game, context.source, effectProperties));

        const lastingEffectRestrictions = card.getOngoingEffectValues(EffectName.CannotApplyLastingEffects);
        return (
            super.canAffect(card, context) &&
              effects.some(
                  (props) =>
                      props.impl.canBeApplied(card) &&
                      !lastingEffectRestrictions.some((condition) => condition(props.effect))
              )
        );
    }

    private getEffectFactoriesAndProperties(card: Card, context: TContext, additionalProperties = {}) {
        const { effect, ...otherProperties } = this.generatePropertiesFromContext(context, additionalProperties);

        const effectProperties = { matchTarget: card, zoneFilter: WildcardZoneName.Any, isLastingEffect: true, ability: context.ability, ...otherProperties };

        return { effectFactories: effect, effectProperties };
    }
}
