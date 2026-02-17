import { EffectName } from '../../Constants';
import { registerState } from '../../GameObjectUtils';
import { getPrintedAttributesOverride } from '../../ongoingEffect/effectImpl/PrintedAttributesOverride';
import * as Contract from '../../utils/Contract';
import type { Card, CardConstructor } from '../Card';

export interface ICardWithCostProperty extends Card {
    get printedCost(): number;
    get cost(): number;
}

/** Mixin function that adds the `cost` property to a base class. */
export function WithCost<TBaseClass extends CardConstructor>(BaseClass: TBaseClass) {
    @registerState()
    class WithCost extends BaseClass implements ICardWithCostProperty {
        private readonly _printedCost: number;

        public get printedCost(): number {
            if (this.hasOngoingEffect(EffectName.PrintedAttributesOverride)) {
                const override = getPrintedAttributesOverride('printedCost', this.getOngoingEffectValues(EffectName.PrintedAttributesOverride));
                if (override != null) {
                    return override;
                }
            }
            return this._printedCost;
        }

        public get cost(): number {
            return this.printedCost;
        }

        // see Card constructor for list of expected args
        public constructor(...args: any[]) {
            super(...args);
            const [Player, cardData] = this.unpackConstructorArgs(...args);

            Contract.assertNotNullLike(cardData.cost);
            this._printedCost = cardData.cost;
        }

        public override hasCost(): this is ICardWithCostProperty {
            return true;
        }
    }

    return WithCost;
}