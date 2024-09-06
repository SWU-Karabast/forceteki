import { ActionAbility } from '../../ability/ActionAbility';
import TriggeredAbility from '../../ability/TriggeredAbility';
import { AbilityType } from '../../Constants';
import { IConstantAbility } from '../../ongoingEffect/IConstantAbility';
import { InPlayCardConstructor } from '../baseClasses/InPlayCard';


/** Mixin function that creates a version of the base class that is a Token. */
export function WithLeaderAbilitySetup<TBaseClass extends InPlayCardConstructor>(BaseClass: TBaseClass) {
    return class WithLeaderAbilitySetup extends BaseClass {
        // see Card constructor for list of expected args
        public constructor(...args: any[]) {
            super(...args);
        }
    };
}
