import AbilityHelper from '../../../AbilityHelper';
import { IActionAbilityProps, IEpicActionProps } from '../../../Interfaces';
import { ActionAbility } from '../../ability/ActionAbility';
import { Card } from '../Card';
import { InPlayCardConstructor } from '../baseClasses/InPlayCard';
import { CardConstructor } from '../Card';

// TODO TOKENS: custom defeat logic and any other logic
/** Mixin function that creates a version of the base class that is a Token. */
export function AsToken<TBaseClass extends InPlayCardConstructor>(BaseClass: TBaseClass) {
    return class AsToken extends BaseClass {
        public override isToken() {
            return true;
        }
    };
}