import type { IReplacementEffectAbilityProps, ITriggeredAbilityProps } from '../../Interfaces';
import type { Card } from '../card/Card';
import type Game from '../Game';
import { ReplacementEffectSystem } from '../../gameSystems/ReplacementEffectSystem';
import ReplacementAbilityBase from './ReplacementAbilityBase';

export default class ReplacementEffectAbility extends ReplacementAbilityBase {
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

        super(game, card, triggeredAbilityProps);
    }
}
