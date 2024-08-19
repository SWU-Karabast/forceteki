import AbilityHelper from '../../../AbilityHelper';
import { IActionAbilityProps, IEpicActionProps } from '../../../Interfaces';
import { CardActionAbility } from '../../ability/CardActionAbility';
import Card from '../Card';
import { InPlayCardConstructor } from '../baseClasses/InPlayCard';
import { CardConstructor } from '../Card';

// TODO TOKENS: custom defeat logic and any other logic
export function Token<TBaseClass extends InPlayCardConstructor>(BaseClass: TBaseClass) {
    return class AsToken extends BaseClass {
        public override isToken() {
            return true;
        }
    };
}