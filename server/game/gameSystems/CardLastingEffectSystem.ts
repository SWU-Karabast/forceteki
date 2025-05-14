import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import type { FormatMessage } from '../core/chat/GameChat';
import { Duration, EffectName, EventName, WildcardZoneName } from '../core/Constants';
import type { ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import type { ILastingEffectPropertiesBase } from '../core/gameSystem/LastingEffectPropertiesBase';
import type { OngoingCardEffect } from '../core/ongoingEffect/OngoingCardEffect';
import type { OngoingPlayerEffect } from '../core/ongoingEffect/OngoingPlayerEffect';
import * as Contract from '../core/utils/Contract';
import * as Helpers from '../core/utils/Helpers';
import type { DistributiveOmit } from '../core/utils/Helpers';
import type { IOngoingEffectGenerator, IOngoingEffectProps } from '../Interfaces';

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

    public eventHandler(event): void {
        let effects = event.effectFactories.map((factory) =>
            factory(event.context.game, event.context.source, event.effectProperties)
        );

        effects = this.filterApplicableEffects(event.card, effects);

        for (const effect of effects) {
            event.context.game.ongoingEffectEngine.add(effect);
        }
    }

    /** Returns the effects that would be applied to {@link card} by this system's configured lasting effects */
    public getApplicableEffects(card: Card, context: TContext, additionalProperties?: Partial<ICardLastingEffectProperties>) {
        const { effectFactories, effectProperties } = this.getEffectFactoriesAndProperties(card, context, additionalProperties);

        const effects = effectFactories.map((factory) =>
            factory(context.game, context.source, effectProperties)
        );

        return this.filterApplicableEffects(card, effects);
    }

    public override getEffectMessage(context: TContext, additionalProperties?: Partial<ICardLastingEffectProperties>): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        let description: string | FormatMessage = 'apply a lasting effect to';
        if (properties.ongoingEffectDescription) {
            description = properties.ongoingEffectDescription;
        } else if (properties.target && Array.isArray(properties.target)) {
            const { effectFactories, effectProperties } = this.getEffectFactoriesAndProperties(properties.target, context, additionalProperties);
            const effectDescriptions = effectFactories.map((factory) => {
                for (const [i, props] of effectProperties.entries()) {
                    const effect = factory(context.game, context.source, props);
                    if (effect.impl.effectDescription && this.filterApplicableEffects(properties.target[i], [effect]).length > 0) {
                        return effect.impl.effectDescription;
                    }
                }
                return null;
            }).filter((description) => description !== null);

            if (effectDescriptions.length > 0) {
                description = {
                    format: '{0} to',
                    args: [effectDescriptions],
                };
            }
        }

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

        return [`{0} {1}${durationStr}`, [description, properties.ongoingEffectTargetDescription ?? properties.target]];
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

    private getEffectFactoriesAndProperties(target: Card, context: TContext, additionalProperties?: Partial<ICardLastingEffectProperties>): { effectFactories: IOngoingEffectGenerator[]; effectProperties: IOngoingEffectProps };
    private getEffectFactoriesAndProperties(target: Card[], context: TContext, additionalProperties?: Partial<ICardLastingEffectProperties>): { effectFactories: IOngoingEffectGenerator[]; effectProperties: IOngoingEffectProps[] };
    private getEffectFactoriesAndProperties(target: Card | Card[], context: TContext, additionalProperties?: Partial<ICardLastingEffectProperties>): { effectFactories: IOngoingEffectGenerator[]; effectProperties: IOngoingEffectProps | IOngoingEffectProps[] } {
        const { effect, ...otherProperties } = this.generatePropertiesFromContext(context, additionalProperties);

        const effectProperties: (card: Card) => IOngoingEffectProps = (card) => ({ matchTarget: card, sourceZoneFilter: WildcardZoneName.Any, isLastingEffect: true, ability: context.ability, ...otherProperties });

        if (Array.isArray(target)) {
            return { effectFactories: Helpers.asArray(effect), effectProperties: target.map((card) => effectProperties(card)) };
        }

        return { effectFactories: Helpers.asArray(effect), effectProperties: effectProperties(target) };
    }

    protected filterApplicableEffects(card: Card, effects: (OngoingCardEffect | OngoingPlayerEffect)[]) {
        const lastingEffectRestrictions = card.getOngoingEffectValues(EffectName.CannotApplyLastingEffects);
        return effects.filter(
            (props) =>
                !lastingEffectRestrictions.some((condition) => condition(props.impl))
        );
    }
}
