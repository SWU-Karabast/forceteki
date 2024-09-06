import AbilityHelper from '../../../AbilityHelper';
import { IActionAbilityProps, IEpicActionProps } from '../../../Interfaces';
import { ActionAbility } from '../../ability/ActionAbility';
import { Card } from '../Card';
import { InPlayCardConstructor } from '../baseClasses/InPlayCard';
import { CardConstructor } from '../Card';
import type { TokenCard } from '../CardTypes';

/** Mixin function that creates a version of the base class that is a Token. */
export function AsToken<TBaseClass extends InPlayCardConstructor>(BaseClass: TBaseClass) {
    return class AsToken extends BaseClass {
        public override isToken(): this is TokenCard {
            return true;
        }
    };
}