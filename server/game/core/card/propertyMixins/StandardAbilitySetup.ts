import type { IAbilityHelper } from '../../../AbilityHelper';
import * as Contract from '../../utils/Contract';
import type { IBasicAbilityRegistrar } from '../AbilityRegistrationInterfaces';
import type { Card, CardConstructor, ICardState } from '../Card';

export interface ICardWithStandardAbilitySetup<T extends Card> extends Card {
    setupCardAbilities(registrar: IBasicAbilityRegistrar<T>): void;
}

/** Mixin function that creates a version of the base class that is a Token. */
export function WithStandardAbilitySetup<TBaseClass extends CardConstructor<TState>, TState extends ICardState>(BaseClass: TBaseClass) {
    return class WithStandardAbilitySetup extends BaseClass implements ICardWithStandardAbilitySetup<Card<TState>> {
        // see Card constructor for list of expected args
        public constructor(...args: any[]) {
            super(...args);

            const [Player, cardData] = this.unpackConstructorArgs(...args);

            this.callSetupWithRegistrar();
            this.validateCardAbilities(this.triggeredAbilities, cardData.text);

            // if an implementation file is provided, enforce that all keywords requiring explicit setup have been set up
            if (this.hasImplementationFile) {
                const keywordsMissingImpl = this._printedKeywords.filter((keyword) => !keyword.isFullyImplemented);
                if (keywordsMissingImpl.length > 0) {
                    const missingKeywordNames = new Set(keywordsMissingImpl.map((keyword) => keyword.name));

                    Contract.fail(`Implementation for card ${this.internalName} is missing one or more required implementations for these keywords: '${Array.from(missingKeywordNames).join(', ')}'`);
                }
            }
        }

        public override hasStandardAbilitySetup(): this is ICardWithStandardAbilitySetup<this> {
            return true;
        }

        protected callSetupWithRegistrar() {
            throw new Error('This method should be overridden in the subclass (such as UnitCard) to set up card abilities with the correct ability registrar type.');
        }

        /**
         * Create card abilities by calling subsequent methods with appropriate properties
         */
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        public setupCardAbilities(registrar: IBasicAbilityRegistrar<this>, AbilityHelper: IAbilityHelper) { }
    };
}
