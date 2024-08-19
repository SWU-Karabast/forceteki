import Contract from '../../utils/Contract';
import { CardConstructor } from '../Card';
import type { Damage } from './Damage';

/**
 * Mixin function that adds the `printedHp` and `hp` properties to a base class.
 * Note that this _does not_ add the damage property. See {@link Damage} for that.
 */
export function PrintedHp<TBaseClass extends CardConstructor>(BaseClass: TBaseClass) {
    return class WithPrintedHp extends BaseClass {
        public readonly printedHp: number;

        public get hp(): number {
            return this.printedHp;
        }

        // see Card constructor for list of expected args
        public constructor(...args: any[]) {
            super(...args);
            const [Player, cardData] = this.unpackConstructorArgs(...args);

            Contract.assertNotNullLike(cardData.hp);
            this.printedHp = cardData.hp;
        }
    };
}