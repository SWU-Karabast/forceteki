import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { EffectName, EventName, WildcardZoneName } from '../core/Constants';
import type { ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import type { ILastingEffectPropertiesBase } from '../core/gameSystem/LastingEffectPropertiesBase';
import type { OngoingCardEffect } from '../core/ongoingEffect/OngoingCardEffect';
import * as Helpers from '../core/utils/Helpers';
import * as LastingEffectSystemHelpers from './helpers/LastingEffectSystemHelpers';
import type { DistributiveOmit } from '../core/utils/Helpers';
import type { IOngoingCardEffectGenerator, IOngoingCardEffectProps } from '../Interfaces';

export type ICardLastingEffectProperties = DistributiveOmit<ILastingEffectPropertiesBase, 'target' | 'effect'> & Pick<ICardTargetSystemProperties, 'target'> & {
    effect: IOngoingCardEffectGenerator | IOngoingCardEffectGenerator[];
};

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

    public eventHandler(event): void {
        let effects = Helpers.asArray(event.effectProperties).flatMap((props: IOngoingCardEffectProps) =>
            (event.effectFactories as IOngoingCardEffectGenerator[]).map((factory) =>
                factory(event.context.game, event.context.source, props)
            )
        );

        effects = this.filterApplicableEffects(event.card, effects);

        for (const effect of effects) {
            event.context.game.ongoingEffectEngine.add(effect);
        }
    }

    /** Returns the effects that would be applied to {@link card} by this system's configured lasting effects */
    public getApplicableEffects(card: Card, context: TContext, additionalProperties?: Partial<ICardLastingEffectProperties>) {
        const { effectFactories, effectProperties } = this.getEffectFactoriesAndProperties(card, context, additionalProperties);

        const effects = Helpers.asArray(effectProperties).flatMap((props) =>
            effectFactories.map((factory) =>
                factory(context.game, context.source, props)
            )
        );

        return this.filterApplicableEffects(card, effects);
    }

    public override getEffectMessage(context: TContext, additionalProperties?: Partial<ICardLastingEffectProperties>): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        return LastingEffectSystemHelpers.getEffectMessage(
            this,
            context,
            properties,
            additionalProperties,
            (target, context, additionalProps) => this.getEffectFactoriesAndProperties(target, context, additionalProps),
            (target, effects) => this.filterApplicableEffects(target, effects)
        );
    }

    public override generatePropertiesFromContext(context: TContext, additionalProperties: Partial<ICardLastingEffectProperties> = {}): ICardLastingEffectProperties {
        const properties = super.generatePropertiesFromContext(context, additionalProperties);
        if (!Array.isArray(properties.effect)) {
            properties.effect = [properties.effect];
        }

        return properties;
    }

    public override addPropertiesToEvent(event: any, card: Card, context: TContext, additionalProperties?: Partial<ICardLastingEffectProperties>): void {
        super.addPropertiesToEvent(event, card, context, additionalProperties);

        const { effectFactories, effectProperties } = this.getEffectFactoriesAndProperties(card, context, additionalProperties);

        event.effectFactories = effectFactories;
        event.effectProperties = effectProperties;
    }

    public override canAffectInternal(card: Card, context: TContext, additionalProperties: Partial<ICardLastingEffectProperties> = {}): boolean {
        const { effectFactories, effectProperties } = this.getEffectFactoriesAndProperties(card, context, additionalProperties);

        const effects = effectFactories.map((factory) => factory(context.game, context.source, effectProperties));

        return super.canAffectInternal(card, context) && this.filterApplicableEffects(card, effects).length > 0;
    }

    private getEffectFactoriesAndProperties(target: Card, context: TContext, additionalProperties?: Partial<ICardLastingEffectProperties>): { effectFactories: IOngoingCardEffectGenerator[]; effectProperties: IOngoingCardEffectProps };
    private getEffectFactoriesAndProperties(target: Card[], context: TContext, additionalProperties?: Partial<ICardLastingEffectProperties>): { effectFactories: IOngoingCardEffectGenerator[]; effectProperties: IOngoingCardEffectProps[] };
    private getEffectFactoriesAndProperties(target: Card | Card[], context: TContext, additionalProperties?: Partial<ICardLastingEffectProperties>): { effectFactories: IOngoingCardEffectGenerator[]; effectProperties: IOngoingCardEffectProps | IOngoingCardEffectProps[] };
    private getEffectFactoriesAndProperties(target: Card | Card[], context: TContext, additionalProperties?: Partial<ICardLastingEffectProperties>): { effectFactories: IOngoingCardEffectGenerator[]; effectProperties: IOngoingCardEffectProps | IOngoingCardEffectProps[] } {
        const { effect, ...otherProperties } = this.generatePropertiesFromContext(context, additionalProperties);

        const effectProperties: (card: Card) => IOngoingCardEffectProps = (card) => ({ matchTarget: card, sourceZoneFilter: WildcardZoneName.Any, isLastingEffect: true, ability: context.ability, ...otherProperties });

        if (Array.isArray(target)) {
            return { effectFactories: Helpers.asArray(effect), effectProperties: target.map((card) => effectProperties(card)) };
        }

        return { effectFactories: Helpers.asArray(effect), effectProperties: effectProperties(target) };
    }

    protected filterApplicableEffects(card: Card, effects: OngoingCardEffect[]) {
        const lastingEffectRestrictions = card.getOngoingEffectValues(EffectName.CannotApplyLastingEffects);

        return effects.filter((effect) => {
            if (card.isBlank() && (effect.impl.type === EffectName.GainAbility || effect.impl.type === EffectName.GainKeyword)) {
                // If the target is blanked, it cannot gain abilities or keywords
                return false;
            }
            return !lastingEffectRestrictions.some((condition) => condition(effect.impl));
        });
    }
}
