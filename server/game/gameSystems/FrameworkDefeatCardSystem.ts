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

        return ['defeat {0} due to {1}', [properties.target, causeStr]];
    }

    // fully override the base canAffect method since nothing can interrupt defeat due to framework effect
    public override canAffect(card: Card): boolean {
        return card.canBeInPlay() && card.isInPlay();
    }

    protected override buildDefeatSourceForType(defeatSourceType: DefeatSourceType, card: Card, context: TContext): IDefeatSource | null {
        switch (defeatSourceType) {
            case DefeatSourceType.UniqueRule:
                return { type: DefeatSourceType.UniqueRule, player: card.controller };
            case DefeatSourceType.FrameworkEffect:
                let responsiblePlayer = null;
                // 1.18.1.D If the above does not apply, and a unit is defeated by having 0 remaining HP,
                // the most recent player whose ability or effect changed the remaining HP of that unit is considered to have defeated that unit.
                if (card?.isUnit && card.isUnit()) {
                    responsiblePlayer = card.lastPlayerToModifyHp;
                }
                // 1.18.1.D If the above does not apply, the active player is considered to have defeated that unit.
                if (responsiblePlayer === null && context.game.currentPhase === PhaseName.Action) {
                    responsiblePlayer = context.game.actionPhaseActivePlayer;
                }
                // 1.18.1.C If the above does not apply, and a unit is defeated during the regroup phase or when a lasting effect expires,
                // no player is considered to have defeated that unit.
                return { type: DefeatSourceType.FrameworkEffect, player: responsiblePlayer };

            default:
                Contract.fail(`Unexpected value for framework defeat source: ${defeatSourceType}`);
        }
    }
}
