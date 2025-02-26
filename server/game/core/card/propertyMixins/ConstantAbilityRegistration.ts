import type { IConstantAbilityProps } from '../../../Interfaces';
import { WildcardZoneName } from '../../Constants';
import type { IConstantAbility } from '../../ongoingEffect/IConstantAbility';
import type { CardConstructor } from '../Card';

/** Mixin function that adds the ability to register constant abilities to a base card class. */
export function WithConstantAbilities<TBaseClass extends CardConstructor>(BaseClass: TBaseClass) {
    return class WithConstantAbilities extends BaseClass {
        protected addConstantAbility(properties: IConstantAbilityProps<this>): IConstantAbility {
            const ability = this.createConstantAbility(properties);
            // This check is necessary to make sure on-play cost-reduction effects are registered
            if (ability.sourceZoneFilter === WildcardZoneName.Any) {
                ability.registeredEffects = this.addEffectToEngine(ability);
            }
            this.constantAbilities.push(ability);
            return ability;
        }
    };
}
