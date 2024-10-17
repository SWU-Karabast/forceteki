import { CardConstructor } from '../Card';

/** Mixin function that creates a version of the base class that is a Token. */
export function WithStandardAbilitySetup<TBaseClass extends CardConstructor>(BaseClass: TBaseClass) {
    return class WithStandardAbilitySetup extends BaseClass {
        // see Card constructor for list of expected args
        public constructor(...args: any[]) {
            super(...args);

            this.setupCardAbilities();
        }

        /**
         * Create card abilities by calling subsequent methods with appropriate properties
         */
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        protected setupCardAbilities() {
        }
    };
}