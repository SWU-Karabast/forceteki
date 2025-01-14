import * as Contract from '../../utils/Contract';
import type { CardConstructor, ICardState } from '../Card';

export interface IWithPrintedPowerState extends ICardState {
    printedPower: number;
    get getPower(): number;
}

/** Mixin function that adds the `printedPower` property to a base class. */
export function WithPrintedPower<TBaseClass extends CardConstructor<TState>, TState extends ICardState>(BaseClass: TBaseClass) {
    return class WithPrintedPower extends (BaseClass as TBaseClass & CardConstructor<TState & IWithPrintedPowerState>) {
        // see Card constructor for list of expected args
        public constructor(...args: any[]) {
            super(...args);
            const [Player, cardData] = this.unpackConstructorArgs(...args);

            Contract.assertNotNullLike(cardData.power);
            this.state.printedPower = cardData.power;
        }

        public getPower(): number {
            return this.state.printedPower;
        }
    };
}