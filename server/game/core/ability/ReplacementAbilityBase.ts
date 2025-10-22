import { AbilityType } from '../Constants';
import type { IDamagePreventionAbilityProps, IReplacementEffectAbilityProps, ITriggeredAbilityProps, WhenTypeOrStandard } from '../../Interfaces';
import type { Card } from '../card/Card';
import type Game from '../Game';
import TriggeredAbility from './TriggeredAbility';
import type { Player } from '../Player';
import { ReplacementEffectContext } from './ReplacementEffectContext';
import type { AbilityContext } from './AbilityContext';
import * as Contract from '../utils/Contract';
import type { GameSystem } from '../gameSystem/GameSystem';
import type { TriggeredAbilityContext } from './TriggeredAbilityContext';
import { isFunction } from 'underscore';

export default class ReplacementAbilityBase extends TriggeredAbility {
    public constructor(game: Game, card: Card, replacementBaseProps: IReplacementEffectAbilityProps | IDamagePreventionAbilityProps,
        replacementSystem: GameSystem<TriggeredAbilityContext>, whenTrigger: WhenTypeOrStandard) {
        const { onlyIfYouDoEffect, ...otherProps } = replacementBaseProps;
        let triggeredAbilityProps: ITriggeredAbilityProps;

        if (onlyIfYouDoEffect) {
            triggeredAbilityProps = {
                ...otherProps,
                immediateEffect: onlyIfYouDoEffect,
                when: whenTrigger,
                ifYouDo: {
                    title: 'Replace Effect',
                    immediateEffect: replacementSystem
                }
            };
        } else {
            triggeredAbilityProps = {
                ...otherProps,
                when: isFunction(whenTrigger) ? null : whenTrigger,
                immediateEffect: replacementSystem
            };
        }

        super(game, card, triggeredAbilityProps, AbilityType.ReplacementEffect);
    }

    protected override buildSubAbilityStepContext(subAbilityStepProps, canBeTriggeredBy: Player, parentContext: AbilityContext) {
        const context = super.buildSubAbilityStepContext(subAbilityStepProps, canBeTriggeredBy, parentContext);

        Contract.assertTrue(parentContext.isReplacement());

        return new ReplacementEffectContext({
            ...context.getProps(),
            event: (parentContext as any).event,
            replacementEffectWindow: (parentContext as ReplacementEffectContext).replacementEffectWindow
        });
    }
}
