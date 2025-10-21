import { AbilityType } from '../Constants';
import type { IReplacementEffectAbilityProps, ITriggeredAbilityProps } from '../../Interfaces';
import type { Card } from '../card/Card';
import type Game from '../Game';
import TriggeredAbility from './TriggeredAbility';
import { ReplacementEffectSystem } from '../../gameSystems/ReplacementEffectSystem';
import type { Player } from '../Player';
import { ReplacementEffectContext } from './ReplacementEffectContext';
import type { AbilityContext } from './AbilityContext';
import * as Contract from '../utils/Contract';

export default class ReplacementEffectAbility extends TriggeredAbility {
    public constructor(game: Game, card: Card, properties: IReplacementEffectAbilityProps) {
        const { replaceWith: cancelProps, onlyIfYouDoEffect, ...otherProps } = properties;
        let triggeredAbilityProps: ITriggeredAbilityProps;

        if (onlyIfYouDoEffect) {
            triggeredAbilityProps = {
                ...otherProps,
                immediateEffect: onlyIfYouDoEffect,
                ifYouDo: {
                    title: 'Replace Effect',
                    immediateEffect: new ReplacementEffectSystem(cancelProps)
                }
            };
        } else {
            triggeredAbilityProps = {
                ...otherProps,
                immediateEffect: new ReplacementEffectSystem(cancelProps)
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
