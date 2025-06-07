import { EffectName } from '../../Constants';
import type { PrintedAttributesOverride } from '../../ongoingEffect/effectImpl/PrintedAttributesOverride';
import * as Contract from '../../utils/Contract';
import type { Card, CardConstructor, ICardState } from '../Card';

export interface ICardWithPrintedPowerProperty extends Card {
    readonly printedPower: number;
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
                return this.getOngoingEffectValues<PrintedAttributesOverride>(EffectName.PrintedAttributesOverride)
                    .reduce((max, override) => (override.printedPower !== undefined ? Math.max(max, override.printedPower) : max), this.printedPower);
            }
            return this.printedPower;
        }
    };
}