import Contract from '../../utils/Contract';
import { CardConstructor } from '../NewCard';

export function Cost<TBaseClass extends CardConstructor>(BaseClass: TBaseClass) {
    return class WithCost extends BaseClass {
        private readonly _printedCost: number;

        // TODO THIS PR: import all of the cost-related code, adjusters etc.

        public get cost(): number {
            return this._printedCost;
        }

        // see NewCard constructor for list of expected args
        public constructor(...args: any[]) {
            super(...args);
            const [Player, cardData] = this.unpackConstructorArgs(...args);

            Contract.assertNotNullLike(cardData.cost);
            this._printedCost = cardData.cost;
        }
    };
}