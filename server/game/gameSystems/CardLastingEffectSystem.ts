import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { Duration, EffectName, EventName, WildcardZoneName } from '../core/Constants';
import type { ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import type { ILastingEffectPropertiesBase } from '../core/gameSystem/LastingEffectPropertiesBase';
import * as Contract from '../core/utils/Contract';
import type { DistributiveOmit } from '../core/utils/Helpers';

export type ICardLastingEffectProperties = DistributiveOmit<ILastingEffectPropertiesBase, 'target'> & Pick<ICardTargetSystemProperties, 'target'>;

/**
 * For a definition, see SWU 7.7.3 'Lasting Effects': "A lasting effect is a part of an ability that affects the game for a specified duration of time.
 * Most lasting effects include the phrase 'for this phase' or 'for this attack.'"
 */
export class CardLastingEffectSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, ICardLastingEffectProperties> {
    public override readonly name: string = 'applyCardLastingEffect';
    public override readonly eventName = EventName.OnEffectApplied;
    protected override readonly defaultProperties: ICardLastingEffectProperties = {
        duration: null,
        effect: [],
        ability: null,
        ongoingEffectDescription: null
    };

    public eventHandler(event, additionalProperties?): void {
        let effects = event.effectFactories.map((factory) =>
            factory(event.context.game, event.context.source, event.effectProperties)
        );

        effects = this.filterApplicableEffects(event.card, effects);

        for (const effect of effects) {
            event.context.game.ongoingEffectEngine.add(effect);
        }
    }

    /** Returns the effects that would be applied to {@link card} by this system's configured lasting effects */
    public getApplicableEffects(card: Card, context: TContext) {
        const { effectFactories, effectProperties } = this.getEffectFactoriesAndProperties(card, context);

        const effects = effectFactories.map((factory) =>
            factory(context.game, context.source, effectProperties)
        );

        return this.filterApplicableEffects(card, effects);
    }

    public override getEffectMessage(context: TContext, additionalProperties?: any): [string, any[]] {
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

        return [`${description} {0}${durationStr}`, [properties.target]];
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

    public override canAffectInternal(card: Card, context: TContext, additionalProperties = {}): boolean {
        const { effectFactories, effectProperties } = this.getEffectFactoriesAndProperties(card, context, additionalProperties);

        const effects = effectFactories.map((factory) => factory(context.game, context.source, effectProperties));

        return super.canAffectInternal(card, context) && this.filterApplicableEffects(card, effects).length > 0;
    }

    private getEffectFactoriesAndProperties(card: Card, context: TContext, additionalProperties = {}) {
        const { effect, ...otherProperties } = this.generatePropertiesFromContext(context, additionalProperties);

        const effectProperties = { matchTarget: card, zoneFilter: WildcardZoneName.Any, isLastingEffect: true, ability: context.ability, ...otherProperties };

        return { effectFactories: effect, effectProperties };
    }

    protected filterApplicableEffects(card: Card, effects: any[]) {
        const lastingEffectRestrictions = card.getOngoingEffectValues(EffectName.CannotApplyLastingEffects);
        return effects.filter(
            (props) =>
                !lastingEffectRestrictions.some((condition) => condition(props.impl))
        );
    }
}
