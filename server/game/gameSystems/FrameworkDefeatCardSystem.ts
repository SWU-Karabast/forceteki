import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { EventName, PhaseName, WildcardCardType } from '../core/Constants';
import { type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import * as Contract from '../core/utils/Contract';
import type { IDamageSource, IDefeatSource } from '../IDamageOrDefeatSource';
import { DefeatSourceType } from '../IDamageOrDefeatSource';
import { DefeatCardSystem } from './DefeatCardSystem';

export interface IFrameworkDefeatCardProperties extends ICardTargetSystemProperties {
    defeatSource: IDamageSource | DefeatSourceType.UniqueRule | DefeatSourceType.FrameworkEffect;
    defeatedByExpiringLastingEffect?: boolean;
    target?: Card | Card[];
}

/**
 * Extension of {@link DefeatCardSystem} that handles special cases where a card is defeated indirectly by a framework effect
 * such as damage or the unique rule. Card implementations **should not** use this system.
 */
export class FrameworkDefeatCardSystem<TContext extends AbilityContext = AbilityContext> extends DefeatCardSystem<TContext, IFrameworkDefeatCardProperties> {
    public override readonly name = 'defeat';
    public override readonly eventName = EventName.OnCardDefeated;
    protected override readonly targetTypeFilter = [WildcardCardType.Unit, WildcardCardType.Upgrade];

    protected override readonly defaultProperties: Partial<IFrameworkDefeatCardProperties> = {
        defeatedByExpiringLastingEffect: false,
    };

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);

        let causeStr: string;
        switch (properties.defeatSource) {
            case DefeatSourceType.UniqueRule:
                causeStr = 'unique rule';
                break;
            case DefeatSourceType.FrameworkEffect:
                causeStr = 'damage';
                break;
            default:
                Contract.fail(`Unexpected framework defeat reason: '${properties.defeatSource}'`);
        }

        return ['defeat {0} due to {1}', [this.getTargetMessage(properties.target, context), causeStr]];
    }

    // fully override the base canAffect method since nothing can interrupt defeat due to framework effect
    public override canAffectInternal(card: Card): boolean {
        return card.canBeInPlay() && card.isInPlay();
    }

    protected override buildDefeatSource(defeatSource: IDamageSource | DefeatSourceType.Ability | DefeatSourceType.UniqueRule | DefeatSourceType.FrameworkEffect, event: any, card: Card, context: TContext): IDefeatSource {
        if (typeof defeatSource === 'object' || defeatSource === DefeatSourceType.Ability) {
            return super.buildDefeatSource(defeatSource, event, card, context);
        }

        const properties = this.generatePropertiesFromContext(context);

        switch (defeatSource) {
            case DefeatSourceType.UniqueRule:
                return { type: DefeatSourceType.UniqueRule, player: card.controller };
            case DefeatSourceType.FrameworkEffect:
                // 1.18.1.C If the above does not apply, and a unit is defeated during the regroup phase or when a lasting effect expires,
                // no player is considered to have defeated that unit.
                if (context.game.currentPhase === PhaseName.Regroup || properties.defeatedByExpiringLastingEffect) {
                    return { type: DefeatSourceType.FrameworkEffect, player: null };
                }

                // 1.18.1.D If the above does not apply, and a unit is defeated by having 0 remaining HP,
                // the most recent player whose ability or effect changed the remaining HP of that unit is considered to have defeated that unit.
                if (card && card.isUnit()) {
                    return { type: DefeatSourceType.FrameworkEffect, player: card.lastPlayerToModifyHp };
                }

                // 1.18.1.E If the above does not apply, the active player is considered to have defeated that unit.
                return { type: DefeatSourceType.FrameworkEffect, player: context.game.actionPhaseActivePlayer };

            default:
                Contract.fail(`Unexpected value for framework defeat source: ${defeatSource}`);
        }
    }
}
