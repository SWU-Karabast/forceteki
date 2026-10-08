import type { TriggeredAbilityContext } from '../core/ability/TriggeredAbilityContext';
import { DamageModificationType, DamageType } from '../core/Constants';
import { MetaEventName } from '../core/Constants';
import type { GameSystem } from '../core/gameSystem/GameSystem';
import type { IReplacementEffectSystemProperties } from './ReplacementEffectSystem';
import { ReplacementEffectSystem } from './ReplacementEffectSystem';
import { Contract } from '../core/utils/Contract';
import { DamageSystem } from './DamageSystem';
import type { FormatMessage } from '../core/chat/GameChat';
import { ChatHelpers } from '../core/chat/ChatHelpers';

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
                case DamageModificationType.Cap:
                    return {
                        format: 'prevent all but {0} damage to {1}',
                        args: [String(properties.amount), this.getTargetMessage(context.event.card, context)],
                    };
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
                case DamageModificationType.Multiply:
                    return {
                        format: 'multiply damage to {0} by {1}',
                        args: [this.getTargetMessage(context.event.card, context), String(properties.amount)],
                    };
                case DamageModificationType.Replace:
                    const replaceWith = properties.replaceWithEffect;
                    const [replaceFormat, replaceArgs] = replaceWith.getEffectMessage(context);
                    return {
                        format: '{0} instead of {1} taking damage',
                        args: [{ format: replaceFormat, args: replaceArgs }, this.getTargetMessage(context.event.card, context)],
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
            case DamageModificationType.Cap:
                Contract.assertPositiveNonZero(properties.amount, `capAmount must be a positive non-zero number for DamageModificationType.Cap. Found: ${properties.amount}`);
                return this.buildModifiedDamage(() => properties.amount);
            case DamageModificationType.PreventAll:
                return null;
            case DamageModificationType.Reduce:
                Contract.assertPositiveNonZero(properties.amount, `preventionAmount must be a positive non-zero number for DamageModificationType.Reduce. Found: ${properties.amount}`);

                // if the damage is fully prevented there is nothing to replace it with - the event is
                // simply marked as replaced, which still counts as resolved for "if you do" effects
                if (DamageSystem.getDamageAmountFromEvent(context.event) - properties.amount <= 0) {
                    return null;
                }

                return this.buildModifiedDamage((originalAmount) => Math.max(originalAmount - properties.amount, 0));
            case DamageModificationType.Increase:
                Contract.assertPositiveNonZero(properties.amount, `amount must be a positive non-zero number for DamageModificationType.Increase. Found: ${properties.amount}`);
                return this.buildModifiedDamage((originalAmount) => originalAmount + properties.amount, true);
            case DamageModificationType.Multiply:
                Contract.assertPositiveNonZero(properties.amount, `amount must be a positive non-zero number for DamageModificationType.Multiply. Found: ${properties.amount}`);
                return this.buildModifiedDamage((originalAmount) => originalAmount * properties.amount, true);
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
        if (properties.modificationType === DamageModificationType.Increase || properties.modificationType === DamageModificationType.Multiply) {
            return true;
        }

        if (context.event.isUnpreventable) {
            return false;
        }

        if (properties.modificationType === DamageModificationType.Cap) {
            return DamageSystem.getDamageAmountFromEvent(context.event) > properties.amount;
        }
        return true;
    }

    /**
     * Builds the damage that replaces the original damage event, keeping its type and source. Excess and Overwhelm damage
     * may not have an amount of their own (see {@link DamageSystem.getDamageAmountFromEvent}), so the new amount is derived
     * from the amount the original event would have dealt.
     */
    private buildModifiedDamage(getAmount: (originalAmount: number) => number, copyDamageFlags = false): GameSystem<TContext> {
        return new DamageSystem<TContext, any>((context) => {
            const event = context.event;
            const properties: Record<string, unknown> = {
                target: event.card,
                amount: getAmount(DamageSystem.getDamageAmountFromEvent(event)),
                source: event.damageSource.type === DamageType.Ability ? event.damageSource.card : event.damageSource.damageDealtBy,
                type: event.type,
                sourceAttack: event.damageSource.attack,
            };

            if (copyDamageFlags) {
                properties.isIndirect = event.isIndirect;
                properties.isUnpreventable = event.isUnpreventable;
            }

            // keep the link to the event the excess damage came from, so that the excess counts as used up once dealt.
            // only set when present, since DamageSystem checks whether the key exists at all
            if (event.type === DamageType.Excess && event.sourceEventForExcessDamage != null) {
                properties.sourceEventForExcessDamage = event.sourceEventForExcessDamage;
            }

            return properties;
        });
    }

    /**
     * Preventing damage is a replacement effect, so fully prevented damage still counts as resolved for
     * "if you do" (CR 8.9). This includes "can't be damaged" effects, which are ruled to be prevent effects.
     */
    protected override nullifiedEventCountsAsResolved(): boolean {
        return true;
    }
}