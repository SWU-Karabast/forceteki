import type { TriggeredAbilityContext } from '../core/ability/TriggeredAbilityContext';
import { DamagePreventionType, DamageType } from '../core/Constants';
import { MetaEventName } from '../core/Constants';
import type { GameSystem } from '../core/gameSystem/GameSystem';
import type { IReplacementEffectAbilityProps } from '../Interfaces';
import { ReplacementEffectSystem } from './ReplacementEffectSystem';
import * as Contract from '../core/utils/Contract';
import { DamageSystem } from './DamageSystem';

export interface IDamagePreventionSystemProperties extends Omit<IReplacementEffectAbilityProps, 'when'> {
    preventionType: DamagePreventionType;
    preventionAmount?: number;
    replaceWithEffect?: GameSystem<TriggeredAbilityContext>;
}

export class DamagePreventionSystem<TContext extends TriggeredAbilityContext = TriggeredAbilityContext, TProperties extends IDamagePreventionSystemProperties = IDamagePreventionSystemProperties> extends ReplacementEffectSystem<TContext, TProperties> {
    public override readonly eventName = MetaEventName.ReplacementEffect;

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        switch (properties.preventionType) {
            case DamagePreventionType.All:
                return ['prevent all damage to {0}', [context.source]];
            case DamagePreventionType.Reduce:
                return ['prevent {0} damage to {1}', [properties.preventionAmount, context.event.card]];
            case DamagePreventionType.Replace:
                const replaceWith = properties.replaceWithEffect;
                const replaceMessage = replaceWith.getEffectMessage(context);
                return ['{0} instead of {1} taking damage', [replaceMessage, context.event.card]];
            default:
                Contract.fail(`Invalid preventionType ${properties.preventionType} for DamagePreventionSystem`);
        }
    }

    protected override getReplacementImmediateEffect(context: TContext, additionalProperties: Partial<TProperties> = {}): GameSystem<TContext> {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        switch (properties.preventionType) {
            case DamagePreventionType.All:
                return null; // Returning NoActionSystem here causes an error: Contract assertion failure: Replacement effect 'GameSystem: ' for replacementEffect did not generate any events
            case DamagePreventionType.Reduce:
                Contract.assertPositiveNonZero(properties.preventionAmount, `preventionAmount must be a positive non-zero number for DamagePreventionType.Reduce. Found: ${properties.preventionAmount}`);
                return new DamageSystem((context) => ({
                    target: context.event.card,
                    amount: Math.max(context.event.amount - properties.preventionAmount, 0),
                    source: context.event.damageSource.type === DamageType.Ability ? context.event.damageSource.card : context.event.damageSource.damageDealtBy,
                    type: context.event.type,
                    sourceAttack: context.event.damageSource.attack,
                }));
            case DamagePreventionType.Replace:
                const replaceWith = properties.replaceWithEffect;
                Contract.assertNotNullLike(replaceWith, 'replaceWith must be defined for DamagePreventionType.Replace');

                return replaceWith as GameSystem<TContext>;
            default:
                Contract.fail(`Invalid preventionType ${properties.preventionType} for DamagePreventionSystem`);
        }
    }
}