import Contract from '../../utils/Contract';
import { CardConstructor } from '../NewCard';

export function Power<TBaseClass extends CardConstructor>(BaseClass: TBaseClass) {
    return class WithPower extends BaseClass {
        private readonly _printedPower: number;

        // TODO THIS PR: import all of the cost-related code, adjusters etc.

        public get power(): number {
            return this._printedPower;
        }

        // see NewCard constructor for list of expected args
        public constructor(...args: any[]) {
            super(...args);
            const [Player, cardData] = this.unpackConstructorArgs(...args);

            Contract.assertNotNullLike(cardData.power);
            this._printedPower = cardData.power;
        }
    };
}