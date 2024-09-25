import * as Contract from '../../utils/Contract';
import { CardConstructor } from '../Card';

/** Mixin function that adds the `printedPower` property to a base class. */
export function WithPrintedPower<TBaseClass extends CardConstructor>(BaseClass: TBaseClass) {
    return class WithPrintedPower extends BaseClass {
        public readonly printedPower: number;

        public get power(): number {
            return this.printedPower;
        }

        // see Card constructor for list of expected args
        public constructor(...args: any[]) {
            super(...args);
            const [Player, cardData] = this.unpackConstructorArgs(...args);

            Contract.assertNotNullLike(cardData.power);
            this.printedPower = cardData.power;
        }
    };
}