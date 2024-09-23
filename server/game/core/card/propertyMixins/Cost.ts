import * as Contract from '../../utils/Contract';
import { CardConstructor } from '../Card';

/** Mixin function that adds the `cost` property to a base class. */
export function WithCost<TBaseClass extends CardConstructor>(BaseClass: TBaseClass) {
    return class WithCost extends BaseClass {
        private readonly _printedCost: number;

        public get cost(): number {
            return this._printedCost;
        }

        // see Card constructor for list of expected args
        public constructor(...args: any[]) {
            super(...args);
            const [Player, cardData] = this.unpackConstructorArgs(...args);

            Contract.assertNotNullLike(cardData.cost);
            this._printedCost = cardData.cost;
        }
    };
}