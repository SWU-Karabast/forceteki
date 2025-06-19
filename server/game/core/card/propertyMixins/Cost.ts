import { EffectName } from '../../Constants';
import type { PrintedAttributesOverride } from '../../ongoingEffect/effectImpl/PrintedAttributesOverride';
import * as Contract from '../../utils/Contract';
import type { Card, CardConstructor } from '../Card';

export interface ICardWithCostProperty extends Card {
    get printedCost(): number;
    get cost(): number;
}

/** Mixin function that adds the `cost` property to a base class. */
export function WithCost<TBaseClass extends CardConstructor>(BaseClass: TBaseClass) {
    return class WithCost extends BaseClass implements ICardWithCostProperty {
        private readonly _printedCost: number;

        public get printedCost(): number {
            if (this.hasOngoingEffect(EffectName.PrintedAttributesOverride)) {
                const overrides = this.getOngoingEffectValues<PrintedAttributesOverride>(EffectName.PrintedAttributesOverride);
                const index = overrides.findIndex((override) => override.printedCost != null);
                if (index >= 0) {
                    return overrides[index].printedCost;
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
    };
}