import { AbilityType } from '../Constants';
import type { IReplacementEffectAbilityProps, ITriggeredAbilityProps } from '../../Interfaces';
import type { Card } from '../card/Card';
import type Game from '../Game';
import TriggeredAbility from './TriggeredAbility';
import { ReplacementEffectSystem } from '../../gameSystems/ReplacementEffectSystem';

export default class ReplacementEffectAbility extends TriggeredAbility {
    public constructor(game: Game, card: Card, properties: IReplacementEffectAbilityProps) {
        const { replaceWith: cancelProps, onlyIfYouDoEffect, ...otherProps } = properties;
        let triggeredAbilityProps: ITriggeredAbilityProps;

        if (onlyIfYouDoEffect) {
            triggeredAbilityProps = {
                ...otherProps,
                immediateEffect: onlyIfYouDoEffect,
                ifYouDo: {
                    title: 'Adjust the damage',
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
}
