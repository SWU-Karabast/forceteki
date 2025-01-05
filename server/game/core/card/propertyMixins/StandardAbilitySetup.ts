import * as Contract from '../../utils/Contract';
import type { CardConstructor } from '../Card';

/** Mixin function that creates a version of the base class that is a Token. */
export function WithStandardAbilitySetup<TBaseClass extends CardConstructor>(BaseClass: TBaseClass) {
    return class WithStandardAbilitySetup extends BaseClass {
        // see Card constructor for list of expected args
        public constructor(...args: any[]) {
            super(...args);

            this.hasImplementationFile = true;
            this.setupCardAbilities();

            // if an implementation file is provided, enforce that all keywords requiring explicit setup have been set up
            if (this.hasImplementationFile) {
                const keywordsMissingImpl = this.printedKeywords.filter((keyword) => !keyword.isFullyImplemented);
                if (keywordsMissingImpl.length > 0) {
                    const missingKeywordNames = new Set(keywordsMissingImpl.map((keyword) => keyword.name));

                    Contract.fail(`Implementation for card ${this.internalName} is missing one or more required implementations for these keywords: '${Array.from(missingKeywordNames).join(', ')}'`);
                }
            }
        }

        /**
         * Create card abilities by calling subsequent methods with appropriate properties
         */
        protected setupCardAbilities() {
            this.hasImplementationFile = false;
        }
    };
}
