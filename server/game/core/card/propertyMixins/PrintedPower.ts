import { EffectName } from '../../Constants';
import { getPrintedAttributesOverride } from '../../ongoingEffect/effectImpl/PrintedAttributesOverride';
import * as Contract from '../../utils/Contract';
import type { Card, CardConstructor, ICardState } from '../Card';

export interface ICardWithPrintedPowerProperty extends Card {
    getPrintedPower(): number;
    getPower(): number;
}

/** Mixin function that adds the `printedPower` property to a base class. */
export function WithPrintedPower<TBaseClass extends CardConstructor<TState>, TState extends ICardState>(BaseClass: TBaseClass) {
    return class WithPrintedPower extends (BaseClass as TBaseClass & CardConstructor<TState>) {
        public readonly printedPower: number;

        // see Card constructor for list of expected args
        public constructor(...args: any[]) {
            super(...args);
            const [Player, cardData] = this.unpackConstructorArgs(...args);

            Contract.assertNotNullLike(cardData.power);
            this.printedPower = cardData.power;
        }

        public getPower(): number {
            return this.getPrintedPower();
        }

        public getPrintedPower(): number {
            if (this.hasOngoingEffect(EffectName.PrintedAttributesOverride)) {
                const override = getPrintedAttributesOverride('printedPower', this.getOngoingEffectValues(EffectName.PrintedAttributesOverride));
                if (override != null) {
                    return override;
                }
            }
            return this.printedPower;
        }
    };
}