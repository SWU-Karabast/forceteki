import type { IReplacementEffectAbilityProps } from '../../Interfaces';
import type { Card } from '../card/Card';
import type Game from '../Game';
import { ReplacementEffectSystem } from '../../gameSystems/ReplacementEffectSystem';
import ReplacementAbilityBase from './ReplacementAbilityBase';
import { registerState } from '../GameObjectUtils';

@registerState()
export default class ReplacementEffectAbility extends ReplacementAbilityBase {
    public constructor(game: Game, card: Card, properties: IReplacementEffectAbilityProps) {
        const { replaceWith: cancelProps, ...otherProps } = properties;

        let whenTrigger = undefined;

        if ('when' in properties) {
            whenTrigger = properties.when;
        }

        super(game, card, otherProps, new ReplacementEffectSystem(cancelProps), whenTrigger);
    }
}
