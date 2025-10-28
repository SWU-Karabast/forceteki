import type { TriggeredAbilityContext } from '../core/ability/TriggeredAbilityContext';
import { DamageModificationType, DamageType } from '../core/Constants';
import { MetaEventName } from '../core/Constants';
import type { GameSystem } from '../core/gameSystem/GameSystem';
import type { IReplacementEffectSystemProperties } from './ReplacementEffectSystem';
import { ReplacementEffectSystem } from './ReplacementEffectSystem';
import * as Contract from '../core/utils/Contract';
import { DamageSystem } from './DamageSystem';
import type { FormatMessage } from '../core/chat/GameChat';
import * as ChatHelpers from '../core/chat/ChatHelpers';

export interface IDamageModificationSystemProperties<TContext extends TriggeredAbilityContext = TriggeredAbilityContext> extends IReplacementEffectSystemProperties<TContext> {
    modificationType: DamageModificationType;
    amount?: number;
    replaceWithEffect?: GameSystem<TriggeredAbilityContext>;
    onlyIfYouDoEffect?: GameSystem<TriggeredAbilityContext>;
}

export class DamageModificationSystem<
    TContext extends TriggeredAbilityContext = TriggeredAbilityContext,
    TProperties extends IDamageModificationSystemProperties<TContext> = IDamageModificationSystemProperties<TContext>
> extends ReplacementEffectSystem<TContext, TProperties> {
    public override readonly eventName = MetaEventName.ReplacementEffect;

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);

        const effectMessage = (): FormatMessage => {
            if (context.event.isUnpreventable) {
                // if there is a limit, in case of unpreventable, limit should be updated
                return {
                    format: 'try to prevent damage but it cannot prevent unpreventable damage',
                    args: [this.getTargetMessage(context.source, context)],
                };
            }

            switch (properties.modificationType) {
                case DamageModificationType.PreventAll:
                    return {
                        format: 'prevent all damage to {0}',
                        args: [this.getTargetMessage(context.source, context)],
                    };
                case DamageModificationType.Reduce:
                    return {
                        format: 'prevent {0} damage to {1}',
                        args: [String(properties.amount), this.getTargetMessage(context.event.card, context)],
                    };
                case DamageModificationType.Increase:
                    return {
                        format: 'increase damage to {0} by {1}',
                        args: [this.getTargetMessage(context.event.card, context), String(properties.amount)],
                    };
                case DamageModificationType.Replace:
                    const replaceWith = properties.replaceWithEffect;
                    const replaceMessage = replaceWith.getEffectMessage(context);
                    return {
                        format: '{0} instead of {1} taking damage',
                        args: [replaceMessage, this.getTargetMessage(context.event.card, context)],
                    };
                default:
                    Contract.fail(`Invalid modificationType ${properties.modificationType} for DamageModificationSystem`);
            }
        };

        return [ChatHelpers.formatWithLength(1, 'to '), [effectMessage()]];
    }

    protected override getReplacementImmediateEffect(context: TContext, additionalProperties: Partial<TProperties> = {}): GameSystem<TContext> {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        if (properties.onlyIfYouDoEffect) {
            return properties.onlyIfYouDoEffect as GameSystem<TContext>;
        }

        switch (properties.modificationType) {
            case DamageModificationType.PreventAll:
                return null;
            case DamageModificationType.Reduce:
                Contract.assertPositiveNonZero(properties.amount, `preventionAmount must be a positive non-zero number for DamageModificationType.Reduce. Found: ${properties.amount}`);
                return new DamageSystem((context) => ({
                    target: context.event.card,
                    amount: Math.max(context.event.amount - properties.amount, 0),
                    source: context.event.damageSource.type === DamageType.Ability ? context.event.damageSource.card : context.event.damageSource.damageDealtBy,
                    type: context.event.type,
                    sourceAttack: context.event.damageSource.attack,
                }));
            case DamageModificationType.Increase:
                Contract.assertPositiveNonZero(properties.amount, `amount must be a positive non-zero number for DamageModificationType.Increase. Found: ${properties.amount}`);
                return new DamageSystem((context) => ({
                    target: context.event.card,
                    amount: context.event.amount + properties.amount,
                    source: context.event.damageSource.type === DamageType.Ability ? context.event.damageSource.card : context.event.damageSource.damageDealtBy,
                    type: context.event.type,
                    isIndirect: context.event.isIndirect,
                    isUnpreventable: context.event.isUnpreventable,
                    sourceAttack: context.event.damageSource.attack,
                }));
            case DamageModificationType.Replace:
                const replaceWith = properties.replaceWithEffect;
                Contract.assertNotNullLike(replaceWith, 'replaceWith must be defined for DamageModificationType.Replace');

                return replaceWith as GameSystem<TContext>;
            default:
                Contract.fail(`Invalid modificationType ${properties.modificationType} for DamageModificationSystem`);
        }
    }

    protected override shouldReplace (context: TContext): boolean {
        const properties = this.generatePropertiesFromContext(context);
        if (properties.modificationType === DamageModificationType.Increase) {
            return true;
        }
        return !context.event.isUnpreventable;
    }
}