import Contract from '../../utils/Contract';
import { CardConstructor } from '../NewCard';

export function PrintedPower<TBaseClass extends CardConstructor>(BaseClass: TBaseClass) {
    return class WithPrintedPower extends BaseClass {
        public readonly printedPower: number;

        public get power(): number {
            return this.printedPower;
        }

        // see NewCard constructor for list of expected args
        public constructor(...args: any[]) {
            super(...args);
            const [Player, cardData] = this.unpackConstructorArgs(...args);

            Contract.assertNotNullLike(cardData.power);
            this.printedPower = cardData.power;
        }
    };
}