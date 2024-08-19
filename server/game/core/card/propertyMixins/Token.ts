import AbilityHelper from '../../../AbilityHelper';
import { IActionProps, IEpicActionProps } from '../../../Interfaces';
import { CardActionAbility } from '../../ability/CardActionAbility';
import Card from '../Card';
import { CardConstructor } from '../NewCard';

// TODO TOKENS: any custom logic we need (other than defeat)?
export function Token<TBaseClass extends CardConstructor>(BaseClass: TBaseClass) {
    return class AsToken extends BaseClass {
        public override isToken() {
            return true;
        }
    };
}