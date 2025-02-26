import type { IReplacementEffectAbilityProps, ITriggeredAbilityProps } from '../../../Interfaces';
import ReplacementEffectAbility from '../../ability/ReplacementEffectAbility';
import type TriggeredAbility from '../../ability/TriggeredAbility';
import type { Card, CardConstructor } from '../Card';

export interface ICardWithTriggeredAbilities {
    getTriggeredAbilities(): TriggeredAbility[];
}

/** Mixin function that adds the ability to register triggered abilities to a base card class. */
export function WithTriggeredAbilities<TBaseClass extends CardConstructor>(BaseClass: TBaseClass) {
    return class WithTriggeredAbilities extends BaseClass {
        /**
         * `SWU 7.6.1`: Triggered abilities have bold text indicating their triggering condition, starting with the word
         * “When” or “On”, followed by a colon and an effect. Examples of triggered abilities are “When Played,”
         * “When Defeated,” and “On Attack” abilities
         */
        public getTriggeredAbilities(): TriggeredAbility[] {
            return this.triggeredAbilities;
        }


        public override canRegisterTriggeredAbilities(): this is ICardWithTriggeredAbilities {
            return true;
        }

        protected addTriggeredAbility(properties: ITriggeredAbilityProps<this>): TriggeredAbility {
            const ability = this.createTriggeredAbility(properties);
            this.triggeredAbilities.push(ability);
            return ability;
        }

        protected addReplacementEffectAbility(properties: IReplacementEffectAbilityProps<this>): ReplacementEffectAbility {
            const ability = this.createReplacementEffectAbility(properties);

            // for initialization and tracking purposes, a ReplacementEffect is basically a Triggered ability
            this.triggeredAbilities.push(ability);

            return ability;
        }

        public createReplacementEffectAbility<TSource extends Card = this>(properties: IReplacementEffectAbilityProps<TSource>): ReplacementEffectAbility {
            return new ReplacementEffectAbility(this.game, this, Object.assign(this.buildGeneralAbilityProps('replacement'), properties));
        }
    };
}
