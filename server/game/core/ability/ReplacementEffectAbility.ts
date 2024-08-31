import { AbilityType } from '../Constants';
import { IReplacementEffectAbilityProps, ITriggeredAbilityProps } from '../../Interfaces';
import { Card } from '../card/Card';
import Game from '../Game';
import TriggeredAbility from './TriggeredAbility';
import { ReplacementEffectSystem } from '../../gameSystems/ReplacementEffectSystem';

export default class ReplacementEffectAbility extends TriggeredAbility {
    public constructor(game: Game, card: Card, properties: IReplacementEffectAbilityProps) {
        const { replaceWith: cancelProps, ...otherProps } = properties;
        const triggeredAbilityProps: ITriggeredAbilityProps =
            Object.assign(otherProps, { immediateEffect: new ReplacementEffectSystem(cancelProps) });

        super(game, card, triggeredAbilityProps, AbilityType.ReplacementEffect);
    }
}
