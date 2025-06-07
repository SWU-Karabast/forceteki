import { EffectName } from '../../Constants';
import type { PrintedAttributesOverride } from '../../ongoingEffect/effectImpl/PrintedAttributesOverride';
import * as Contract from '../../utils/Contract';
import type { Card, CardConstructor } from '../Card';

export interface ICardWithPrintedHpProperty extends Card {
    readonly printedHp: number;
    getPrintedHp(): number;
    getHp(): number;
}

/**
 * Mixin function that adds the `printedHp` and `hp` properties to a base class.
 * Note that this _does not_ add the damage property. See {@link WithDamage} for that.
 */
export function WithPrintedHp<TBaseClass extends CardConstructor>(BaseClass: TBaseClass) {
    return class WithPrintedHp extends BaseClass implements ICardWithPrintedHpProperty {
        public readonly printedHp: number;

        // see Card constructor for list of expected args
        public constructor(...args: any[]) {
            super(...args);
            const [Player, cardData] = this.unpackConstructorArgs(...args);

            Contract.assertNotNullLike(cardData.hp);
            this.printedHp = cardData.hp;
        }

        public getHp(): number {
            return this.getPrintedHp();
        }

        public getPrintedHp(): number {
            if (this.hasOngoingEffect(EffectName.PrintedAttributesOverride)) {
                return this.getOngoingEffectValues<PrintedAttributesOverride>(EffectName.PrintedAttributesOverride)
                    .reduce((max, override) => (override.printedHp !== undefined ? Math.max(max, override.printedHp) : max), this.printedHp);
            }
            return this.printedHp;
        }
    };
}