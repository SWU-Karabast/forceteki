import type { TriggeredAbilityContext } from '../core/ability/TriggeredAbilityContext';
import type { Card } from '../core/card/Card';
import type { RelativePlayer } from '../core/Constants';
import { DamagePreventionType, DamageType } from '../core/Constants';
import { MetaEventName } from '../core/Constants';
import type { GameSystem } from '../core/gameSystem/GameSystem';
import type { DamageSourceType } from '../IDamageOrDefeatSource';
import type { IReplacementEffectAbilityProps } from '../Interfaces';
import { ReplacementEffectSystem } from './ReplacementEffectSystem';
import * as Contract from '../core/utils/Contract';
import { DamageSystem } from './DamageSystem';

export interface IDamagePreventionSystemProperties extends Omit<IReplacementEffectAbilityProps, 'when'> {
    preventionType: DamagePreventionType;
    preventDamageFromSource?: RelativePlayer; // TSTODO - update to accept an array
    preventDamageFrom?: DamageSourceType;
    preventionAmount?: number;
    replaceWithSystem?: GameSystem;
    triggerCondition?: (card: Card, context?: TriggeredAbilityContext) => boolean; // This can be used to override the default trigger condition for special cases
}

export class DamagePreventionSystem<TContext extends TriggeredAbilityContext = TriggeredAbilityContext> extends ReplacementEffectSystem<TContext, IDamagePreventionSystemProperties> {
    public override readonly eventName = MetaEventName.ReplacementEffect;

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        switch (properties.preventionType) {
            case DamagePreventionType.All:
                return ['prevent all damage to {0}', [context.source]];
            case DamagePreventionType.Reduce:
                return ['prevent {0} damage to {1}', [properties.preventionAmount, context.event.card]];
            case DamagePreventionType.Replace:
                const replaceWith = properties.replaceWithSystem;
                const replaceMessage = replaceWith.getEffectMessage(context);
                return ['{0} instead of {1} taking damage', [replaceMessage, context.event.card]]; // TODO: how the heck do we get the effect description from the replacementImmediateEffect here?
            default:
                Contract.fail(`Invalid preventionType ${properties.preventionType} for DamagePreventionSystem`);
        }
    }

    protected override getReplacementImmediateEffect(context: TContext, additionalProperties: Partial<IDamagePreventionSystemProperties> = {}): GameSystem<TContext> {
        const properties = super.generatePropertiesFromContext(context, additionalProperties) as IDamagePreventionSystemProperties;

        switch (properties.preventionType) {
            case DamagePreventionType.All:
                return null; // Returning NoActionSystem here causes an error: Contract assertion failure: Replacement effect 'GameSystem: ' for replacementEffect did not generate any events
            case DamagePreventionType.Reduce:
                Contract.assertPositiveNonZero(properties.preventionAmount, 'preventionAmount must be a positive non-zero number for DamagePreventionType.Reduce');
                return new DamageSystem((context) => ({
                    target: context.event.card,
                    amount: Math.max(context.event.amount - properties.preventionAmount, 0),
                    source: context.event.damageSource.type === DamageType.Ability ? context.event.damageSource.card : context.event.damageSource.damageDealtBy, // Copied this from Cassian - why is it capitalized?
                    type: context.event.type,
                    sourceAttack: context.event.damageSource.attack,
                }));
            case DamagePreventionType.Replace:
                const replaceWith = properties.replaceWithSystem;
                Contract.assertNotNullLike(replaceWith, 'replaceWith must be defined for DamagePreventionType.Replace');

                return replaceWith as GameSystem<TContext>;
            default:
                Contract.fail(`Invalid preventionType ${properties.preventionType} for DamagePreventionSystem`);
        }
    }
}