import * as Contract from '../../utils/Contract';
import type { CardConstructor, ICardState } from '../Card';
import type { CardWithCost } from '../CardTypes';

export interface ICostState extends ICardState {
    printedCost: number;
    get cost(): number;
}

/** Mixin function that adds the `cost` property to a base class. */
export function WithCost<TBaseClass extends CardConstructor<TState>, TState extends ICardState>(BaseClass: TBaseClass) {
    return class WithCost extends (BaseClass as TBaseClass & CardConstructor<TState & ICostState>) {
        public get cost(): number {
            return this.state.printedCost;
        }

        // see Card constructor for list of expected args
        public constructor(...args: any[]) {
            super(...args);
            const [Player, cardData] = this.unpackConstructorArgs(...args);

            Contract.assertNotNullLike(cardData.cost);
            this.state.printedCost = cardData.cost;
        }

        public override hasCost(): this is CardWithCost {
            return true;
        }

        // protected override onSetupDefaultState(): void {
        //     super.onSetupDefaultState();
        //     this.state.printedCost = 0;
        // }
    };
}