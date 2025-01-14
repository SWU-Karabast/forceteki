import * as Contract from '../../utils/Contract';
import type { CardConstructor, ICardState } from '../Card';

export interface IWithPrintedHpState extends ICardState {
    printedHp: number;
}

/**
 * Mixin function that adds the `printedHp` and `hp` properties to a base class.
 * Note that this _does not_ add the damage property. See {@link WithDamage} for that.
 */
export function WithPrintedHp<TBaseClass extends CardConstructor<TState>, TState extends ICardState>(BaseClass: TBaseClass) {
    return class WithPrintedHp extends (BaseClass as TBaseClass & CardConstructor<TState & IWithPrintedHpState>) {
        // see Card constructor for list of expected args
        public constructor(...args: any[]) {
            super(...args);
            const [Player, cardData] = this.unpackConstructorArgs(...args);

            Contract.assertNotNullLike(cardData.hp);
            this.state.printedHp = cardData.hp;
        }

        public getHp(): number {
            return this.state.printedHp;
        }
    };
}