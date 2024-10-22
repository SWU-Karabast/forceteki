import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { EventName, WildcardCardType } from '../core/Constants';
import { type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import * as Contract from '../core/utils/Contract';
import { DefeatSourceType, IDamageSource, IDefeatSource } from '../IDamageOrDefeatSource';
import { DefeatCardSystem } from './DefeatCardSystem';

export interface IFrameworkDefeatCardProperties extends ICardTargetSystemProperties {
    defeatSource: IDamageSource | DefeatSourceType.UniqueRule | DefeatSourceType.FrameworkEffect;
    target: Card | Card[];
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
    public override canAffect(card: Card, context: TContext): boolean {
        const { target } = this.generatePropertiesFromContext(context);

        let nonArrayTarget: Card;
        if (Array.isArray(target)) {
            Contract.assertArraySize(target, 1);
            nonArrayTarget = target[0];
        } else {
            nonArrayTarget = card;
        }

        return nonArrayTarget === card;
    }

    protected override buildDefeatSourceForType(defeatSourceType: DefeatSourceType, card: Card, context: TContext): IDefeatSource | null {
        switch (defeatSourceType) {
            case DefeatSourceType.UniqueRule:
                return { type: DefeatSourceType.UniqueRule, player: card.controller };
            case DefeatSourceType.FrameworkEffect:
                // TODO: this is a workaround until we get comp rules 3.0
                return null;
            default:
                Contract.fail(`Unexpected value for defeat source: ${defeatSourceType}`);
        }
    }
}
